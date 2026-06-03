// B"H
import { $ } from "./dom.js";

const b64 = value => btoa(unescape(encodeURIComponent(String(value ?? ""))));
const RAW_LIMIT = 24000;

/**
 * B"H
 * Chapter 386: The Error Stopped Screaming In The Courtyard.
 *
 * Raw JSON is a useful basement, not the front door. Every result now appears
 * first as a human sentence with cause, status, and next step. The full object
 * is still preserved, but only inside a closed diagnostic gate the user may
 * open intentionally.
 */
export function tunnelName() { return ($("tunnelName")?.value || "").trim(); }
function apiKey() { return localStorage.getItem("awtTunnelApiKey") || ""; }
function authHeaders(extra = {}) { const key = apiKey(); return key ? { ...extra, "x-awtsmoos-api-key": key } : extra; }
function addValue(u, key, value) { if (value !== undefined && value !== null && value !== "") u.searchParams.set(key, String(value)); }
function addBool(u, key, value) { if (value === true || value === false) u.searchParams.set(key, String(value)); }
function add64(u, key, value) { if (value !== undefined && value !== null) u.searchParams.set(key, b64(value)); }
function addJson64(u, key, value) { if (value !== undefined && value !== null) u.searchParams.set(key, b64(JSON.stringify(value))); }

export function fsUrl(opts = {}) {
  const name = opts.tunnelName || tunnelName();
  const u = new URL("/api/tunnel/control/fs/" + encodeURIComponent(name), location.origin);
  addValue(u, "action", opts.action || "list");
  ["p", "path", "absolutePath", "root", "local", "relay", "targetVessel", "vessel", "fallback", "depth", "limit", "maxChars", "totalMaxChars", "maxFiles", "offsetChars", "maxBytes", "offsetBytes", "shell", "cwd", "timeoutMs", "url", "selector", "port", "chromePath", "userDataDir", "provider", "providerId", "agent", "agentId", "model", "taskId", "kind", "title", "outputDir", "fileName", "maxDepth", "maxChildrenPerTask", "maxTotalTasks"].forEach(key => addValue(u, key, opts[key]));
  ["allowWrite", "allowSecrets", "allowCommands", "enableLocalHttpProxy", "regex", "replaceAll", "stream", "allowRecursiveSpawn"].forEach(key => addBool(u, key, opts[key]));
  add64(u, "content64", opts.content); add64(u, "find64", opts.find); add64(u, "replace64", opts.replace); add64(u, "query64", opts.query); add64(u, "command64", opts.command); add64(u, "script64", opts.scriptText); add64(u, "text64", opts.text); add64(u, "expression64", opts.expression); add64(u, "message64", opts.message); add64(u, "prompt64", opts.prompt); add64(u, "system64", opts.system); add64(u, "apiKey64", opts.apiKey);
  addJson64(u, "paths64", opts.paths); addJson64(u, "files64", opts.files); addJson64(u, "writes64", opts.writes); addJson64(u, "edits64", opts.edits); addJson64(u, "script64", opts.script); addJson64(u, "input64", opts.input); addJson64(u, "tools64", opts.tools); addJson64(u, "chrome64", opts.chrome); addJson64(u, "commandConfig64", opts.commandConfig); addJson64(u, "messages64", opts.messages);
  return u.toString();
}

export async function callFs(opts) {
  const url = fsUrl(opts);
  if ($("actionUrlOut")) $("actionUrlOut").textContent = url;
  const res = await fetch(url, { credentials: "include", headers: authHeaders({ Accept: "application/json" }) });
  const text = await res.text();
  try { const json = JSON.parse(text); if (json && json.type === "TUNNEL_RESPONSE") json.ok = json.ok !== false; return json; }
  catch (_e) { return { ok: false, status: res.status, error: "non_json_response", raw: text.slice(0, RAW_LIMIT) }; }
}

export function humanError(value) {
  if (!value) return "unknown error";
  if (typeof value === "string") return value;
  if (value.message) return humanError(value.message);
  if (value.error) return humanError(value.error);
  return "Request failed.";
}

export function show(id, value) {
  const el = $(id);
  if (!el) return;
  el.replaceChildren(resultCard(value));
}

export function resultCard(value) {
  const data = normalizeResult(value);
  const wrap = document.createElement("div");
  wrap.className = "awt-result-card " + (data.ok ? "awt-result-ok" : "awt-result-error");
  const title = document.createElement("strong");
  title.textContent = data.title;
  const summary = document.createElement("p");
  summary.textContent = data.summary;
  wrap.append(title, summary);
  if (data.next) { const next = document.createElement("p"); next.className = "awt-result-next"; next.textContent = data.next; wrap.append(next); }
  const details = document.createElement("details");
  details.className = "awt-raw-details";
  const sum = document.createElement("summary");
  sum.textContent = "Diagnostics / raw response";
  const pre = document.createElement("pre");
  pre.textContent = data.raw;
  details.append(sum, pre);
  wrap.append(details);
  return wrap;
}

function normalizeResult(value) {
  const ok = value?.ok !== false && !value?.error;
  const code = value?.code || value?.error?.code || value?.error;
  const status = value?.status || value?.statusCode || value?.error?.statusCode;
  const action = value?.action ? ` ${value.action}` : "";
  const title = ok ? `Success${action}` : `Action failed${action}${status ? " · " + status : ""}`;
  const summary = ok ? successSummary(value) : failureSummary(value, code);
  return { ok, title, summary, next: ok ? successNext(value) : failureNext(value, code), raw: safeJson(value) };
}
function successSummary(value) {
  if (value?.uiMessage) return value.uiMessage;
  if (value?.taskId) return `Task spawned: ${value.taskId}.`;
  if (Array.isArray(value?.tasks)) return `${value.tasks.length} task records loaded.`;
  if (Array.isArray(value?.agents)) return `${value.agents.length} agents loaded.`;
  return "The request completed.";
}
function successNext(value) { return value?.taskId ? "Use Check status or Get result with this task id." : "Open diagnostics only if you need the exact JSON."; }
function failureSummary(value, code) {
  if (code === "INVALID_ROUTE") return "The browser reached the Awtsmoos server, but the server route did not match this request.";
  if (code === "missing_active_api_key") return "This action needs an active API key or OAuth session scope.";
  if (code === "no_connected_tunnel") return "No matching local tunnel is connected for this action.";
  return humanError(value);
}
function failureNext(value, code) {
  if (code === "INVALID_ROUTE") return "Likely cause: stale deployed server/client route, wrong base URL, or cached old tunnel-control bundle. Hard-refresh and verify /api/tunnel/control/fs/{tunnelName} is registered on the running server.";
  if (code === "no_connected_tunnel") return "Use a connected tunnel name, or switch to awtsmoos-virtual-os / targetVessel=virtual-os.";
  return "Open diagnostics for exact status, route, and server details.";
}
function safeJson(value) { try { return JSON.stringify(value, null, 2).slice(0, RAW_LIMIT); } catch { return String(value).slice(0, RAW_LIMIT); } }

export async function apiGet(path) { const res = await fetch(path, { credentials: "include", headers: authHeaders({ Accept: "application/json" }) }); return await res.json(); }
export async function apiPostForm(path, data) { const body = new URLSearchParams(); for (const [k, v] of Object.entries(data || {})) body.set(k, String(v ?? "")); const res = await fetch(path, { method: "POST", credentials: "include", headers: authHeaders({ Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" }), body }); return await res.json(); }
