// B"H
import { $ } from "./dom.js";
import { attachRequestGuard, validateResponseGuard } from "../api/requestGuard.js";

const b64 = value => btoa(unescape(encodeURIComponent(String(value ?? ""))));
const RAW_LIMIT = 24000;

/**
 * B"H
 * Chapter 803: The raw response entered the cellar and one command shone.
 *
 * Tunnel Control now shows the AwtsmoosNext focus first. Raw JSON remains, but
 * it is no longer the palace door; it is a diagnostic cellar opened on purpose.
 */
export function tunnelName() { return ($("tunnelName")?.value || "").trim(); }
function apiKey() { return localStorage.getItem("awtTunnelApiKey") || ""; }
function authHeaders(extra = {}) { const key = apiKey(); return key ? { ...extra, "x-awtsmoos-api-key": key } : extra; }
function addValue(u, key, value) { if (value !== undefined && value !== null && value !== "") u.searchParams.set(key, String(value)); }
function addBool(u, key, value) { if (value === true || value === false) u.searchParams.set(key, String(value)); }
function add64(u, key, value) { if (value !== undefined && value !== null) u.searchParams.set(key, b64(value)); }
function addJson64(u, key, value) { if (value !== undefined && value !== null) u.searchParams.set(key, b64(JSON.stringify(value))); }

export function fsUrl(rawOpts = {}) {
  const opts = attachRequestGuard(rawOpts);
  const u = new URL("/api/tunnel/control/fs/" + encodeURIComponent(opts.tunnelName || tunnelName()), location.origin);
  addValue(u, "action", opts.action || "list");
  addValue(u, "clientRequestId", opts.clientRequestId);
  ["p", "path", "absolutePath", "root", "local", "relay", "targetVessel", "vessel", "fallback", "depth", "limit", "maxChars", "totalMaxChars", "maxFiles", "offsetChars", "maxBytes", "offsetBytes", "shell", "cwd", "timeoutMs", "url", "selector", "port", "chromePath", "userDataDir", "provider", "providerId", "agent", "agentId", "model", "taskId", "kind", "title", "outputDir", "fileName", "maxDepth", "maxChildrenPerTask", "maxTotalTasks", "conversationId", "conversationName"].forEach(key => addValue(u, key, opts[key]));
  ["allowWrite", "allowSecrets", "allowCommands", "enableLocalHttpProxy", "regex", "replaceAll", "stream", "allowRecursiveSpawn"].forEach(key => addBool(u, key, opts[key]));
  ["content", "find", "replace", "query", "command", "scriptText", "text", "expression", "message", "prompt", "system", "apiKey"].forEach(key => add64(u, key === "scriptText" ? "script64" : key + "64", opts[key]));
  ["paths", "files", "writes", "edits", "script", "input", "tools", "chrome", "commandConfig", "messages"].forEach(key => addJson64(u, key + "64", opts[key]));
  return u.toString();
}

export async function callFs(rawOpts) {
  const opts = attachRequestGuard(rawOpts || {});
  const url = fsUrl(opts);
  if ($("actionUrlOut")) $("actionUrlOut").textContent = url;
  const res = await fetch(url, { credentials: "include", headers: authHeaders({ Accept: "application/json" }) });
  const text = await res.text();
  try { const json = JSON.parse(text); if (json?.type === "TUNNEL_RESPONSE") json.ok = json.ok !== false; return validateResponseGuard(json, opts); }
  catch { return { ok: false, status: res.status, error: "non_json_response", raw: text.slice(0, RAW_LIMIT) }; }
}

export function humanError(value) {
  if (!value) return "unknown error";
  if (typeof value === "string") return value;
  if (value.message) return humanError(value.message);
  if (value.error) return humanError(value.error);
  return "Request failed.";
}
export function show(id, value) { const el = $(id); if (el) el.replaceChildren(resultCard(value)); }

export function resultCard(value) {
  const data = normalizeResult(value);
  const wrap = document.createElement("div");
  wrap.className = "awt-result-card " + (data.ok ? "awt-result-ok" : "awt-result-error");
  wrap.append(line("strong", data.title), line("p", data.summary));
  if (data.focus) wrap.append(focusBox(data.focus));
  if (data.next) wrap.append(line("p", data.next, "awt-result-next"));
  wrap.append(rawDetails(data.raw));
  return wrap;
}

function focusBox(focus) {
  const box = document.createElement("section");
  box.className = "awt-response-focus";
  box.append(line("small", "ONE MAIN THING"), line("strong", focus.oneMainThing || focus.prompt || "Continue with the next verified action."));
  if (focus.nextAction?.action) box.append(line("code", `next: ${focus.nextAction.action}`));
  if (focus.mustAnswerGate) box.append(line("p", "Answer the completion gate before any final answer."));
  return box;
}
function normalizeResult(value) {
  const ok = value?.ok !== false && !value?.error;
  const action = value?.action ? ` ${value.action}` : "";
  const status = value?.status || value?.statusCode;
  const title = ok ? `Success${action}` : `Action failed${action}${status ? " · " + status : ""}`;
  const focus = value?.responseFocus || value?.awtsmoosNext || value?.aiGuidance?.responseFocus || null;
  const summary = focus?.oneMainThing || (ok ? successSummary(value) : failureSummary(value, value?.code || value?.error));
  return { ok, title, summary, focus, next: ok ? successNext(value, focus) : failureNext(value, value?.code || value?.error), raw: safeJson(value) };
}
function successSummary(value) {
  if (value?.uiMessage) return value.uiMessage;
  if (value?.taskId) return `Task spawned: ${value.taskId}.`;
  if (Array.isArray(value?.tasks)) return `${value.tasks.length} task records loaded.`;
  if (Array.isArray(value?.agents)) return `${value.agents.length} agents loaded.`;
  return "The request completed.";
}
function successNext(value, focus) {
  if (focus?.nextAction?.action) return `Run ${focus.nextAction.action} next.`;
  return value?.taskId ? "Use Check status or Get result with this task id." : "Open diagnostics only if you need the exact JSON.";
}
function failureSummary(value, code) {
  if (code === "INVALID_ROUTE") return "The server route did not match this request.";
  if (code === "missing_active_api_key") return "This action needs an active API key or OAuth session scope.";
  if (code === "no_connected_tunnel") return "No matching local tunnel is connected for this action.";
  return humanError(value);
}
function failureNext(_value, code) {
  if (code === "no_connected_tunnel") return "Use a connected tunnel, or switch to awtsmoos-virtual-os / targetVessel=virtual-os.";
  return "Open diagnostics for exact status, route, and server details.";
}
function rawDetails(raw) { const d = document.createElement("details"), s = line("summary", "Diagnostics / raw response"), p = line("pre", raw); d.className = "awt-raw-details"; d.append(s, p); return d; }
function line(tag, text, className = "") { const el = document.createElement(tag); if (className) el.className = className; el.textContent = String(text ?? ""); return el; }
function safeJson(value) { try { return JSON.stringify(value, null, 2).slice(0, RAW_LIMIT); } catch { return String(value).slice(0, RAW_LIMIT); } }
export async function apiGet(path) { const res = await fetch(path, { credentials: "include", headers: authHeaders({ Accept: "application/json" }) }); return await res.json(); }
export async function apiPostForm(path, data) { const body = new URLSearchParams(); for (const [k, v] of Object.entries(data || {})) body.set(k, String(v ?? "")); const res = await fetch(path, { method: "POST", credentials: "include", headers: authHeaders({ Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" }), body }); return await res.json(); }
