// B"H
import { getJson } from "./http.js";
import { b64Json, b64Text } from "../lib/base64.js";
import { authHeaders, getActiveApiKey } from "./keySession.js";
import { log } from "../logger.js";
import { currentTargetVesselName, VIRTUAL_OS_TUNNEL } from "../features/vessels/selector.js";

const SESSION_OK_ACTIONS = new Set([
  "configGet", "configSet", "roots", "rootBrowse", "rootSelect", "openRoot",
  "aiAgentList", "aiAgentSetProviderKey", "aiAgentRemoveProviderKey", "aiAgentMessage",
  "aiAgentSpawnTask", "aiAgentSpawnNovel", "aiAgentTaskStatus", "aiAgentTaskResult",
  "aiAgentTaskList", "aiAgentConfigSet", "actionHistoryList", "actionHistoryGet",
  "actionHistorySearch", "actionHistoryExplain", "actionHistoryDiff",
  "chromeFind", "chromeLaunch", "chromeStatus", "chromeNavigate", "chromeWaitForSelector",
  "chromeClick", "chromeType", "chromeEval", "chromeRunScript"
]);

const AI_ACTIONS = new Set([
  "aiAgentList", "aiAgentSetProviderKey", "aiAgentRemoveProviderKey", "aiAgentMessage",
  "aiAgentSpawnTask", "aiAgentSpawnNovel", "aiAgentTaskStatus", "aiAgentTaskResult",
  "aiAgentTaskList", "aiAgentConfigSet"
]);

/**
 * B"H
 * Chapter: The URL Learned The Name Of Its Vessel.
 *
 * The same action surface now serves native tunnels, browser-tab vessels, and
 * Hosted Virtual OS. The selected vessel becomes the path segment unless a
 * caller explicitly overrides it. Thus every AI action and FS action drinks
 * from the same chosen cup.
 */
function setNum(u, name, value) { if (value !== undefined && value !== null && value !== "") u.searchParams.set(name, String(value)); }
function setText(u, name, value) { if (value !== undefined && value !== null && value !== "") u.searchParams.set(name + "64", b64Text(value)); }
function setJson(u, name, value) { if (value !== undefined && value !== null) u.searchParams.set(name + "64", b64Json(value)); }

function publicAiPayload(opts = {}) {
  const keep = [
    "provider", "providerId", "agent", "agentId", "model", "taskId", "kind", "title",
    "outputDir", "fileName", "message", "prompt", "system", "stream", "maxDepth",
    "maxChildrenPerTask", "maxTotalTasks", "allowRecursiveSpawn", "pollIntervalMs",
    "promotionCycles", "agentCycles", "chapterCycles", "providerTimeoutMs", "limit",
    "apiKey", "saveToAccount", "saveProviderKeyToAccount", "remoteSaveAccount",
    "storeProviderKeyRemotely", "targetVessel"
  ];
  return Object.fromEntries(keep.filter(key => opts[key] !== undefined && opts[key] !== null && opts[key] !== "").map(key => [key, opts[key]]));
}

function attachAiPayload(u, opts = {}) {
  if (!AI_ACTIONS.has(opts.action || "")) return;
  const payload = publicAiPayload(opts);
  if (Object.keys(payload).length) setText(u, "text", JSON.stringify(payload));
}

export function resolveTargetTunnelName(tunnelName = "", opts = {}) {
  return String(opts.tunnelName || opts.targetVessel || opts.vessel || currentTargetVesselName(tunnelName) || tunnelName || VIRTUAL_OS_TUNNEL).trim();
}

export function buildFsUrl(tunnelName, opts = {}) {
  const targetName = resolveTargetTunnelName(tunnelName, opts);
  const u = new URL("/api/tunnel/control/fs/" + encodeURIComponent(targetName), location.origin);
  u.searchParams.set("action", opts.action || "list");
  u.searchParams.set("p", opts.path || opts.p || ".");
  if (targetName) u.searchParams.set("targetVessel", targetName);
  if (opts.absolutePath) u.searchParams.set("absolutePath", opts.absolutePath);
  for (const key of ["depth", "limit", "maxChars", "totalMaxChars", "maxFiles", "offsetChars", "maxBytes", "offsetBytes", "timeoutMs", "port", "maxDepth", "maxChildrenPerTask", "maxTotalTasks"]) setNum(u, key, opts[key]);
  setText(u, "content", opts.content); setJson(u, "paths", opts.paths); setJson(u, "files", opts.files); setJson(u, "writes", opts.writes);
  setText(u, "find", opts.find); setText(u, "replace", opts.replace); setText(u, "command", opts.command);
  if (!AI_ACTIONS.has(opts.action || "")) {
    setText(u, "text", opts.text); setText(u, "apiKey", opts.apiKey);
    setText(u, "message", opts.message); setText(u, "prompt", opts.prompt); setText(u, "system", opts.system);
  }
  setText(u, "expression", opts.expression);
  attachAiPayload(u, { ...opts, targetVessel: targetName });
  if (typeof opts.regex === "boolean") u.searchParams.set("regex", String(opts.regex));
  if (typeof opts.replaceAll === "boolean") u.searchParams.set("replaceAll", String(opts.replaceAll));
  for (const key of ["root", "local", "relay", "setTunnelName", "shell", "cwd", "url", "selector", "chromePath", "userDataDir", "id", "query", "conversationId", "conversationName"]) if (opts[key]) u.searchParams.set(key, opts[key]);
  for (const key of ["allowWrite", "allowSecrets", "enableLocalHttpProxy", "allowCommands", "stream"]) if (typeof opts[key] === "boolean") u.searchParams.set(key, String(opts[key]));
  setJson(u, "tools", opts.tools); setJson(u, "chrome", opts.chrome); setJson(u, "commandConfig", opts.commandConfig); setJson(u, "aiAgents", opts.aiAgents); setJson(u, "messages", opts.messages);
  if (typeof opts.script === "string") setText(u, "script", opts.script); else setJson(u, "script", opts.script);
  setJson(u, "input", opts.input);
  return u.toString();
}

export async function callFs(tunnelNameOrOpts, maybeOpts) {
  const opts = maybeOpts || tunnelNameOrOpts || {};
  const tunnelName = maybeOpts ? tunnelNameOrOpts : opts.tunnelName;
  const action = opts.action || "list";
  const targetName = resolveTargetTunnelName(tunnelName, opts);
  const url = buildFsUrl(targetName, opts);
  const apiKey = await getActiveApiKey();
  log("callFs", { action, tunnelName: targetName, url, hasApiKey: !!apiKey });
  if (!apiKey && !SESSION_OK_ACTIONS.has(action)) return { BH: "B\"H", ok: false, error: "missing_active_api_key", message: "Create, paste, or select an API key first. File and terminal actions need API key or equivalent OAuth scope.", needed: action.startsWith("command") ? "tunnel.command" : "tunnel.read/tunnel.write" };
  const headers = apiKey ? await authHeaders() : {};
  return await getJson(url, { headers, credentials: "include" });
}

export async function buildCurl(tunnelName, opts) {
  const apiKey = await getActiveApiKey();
  const targetName = resolveTargetTunnelName(tunnelName, opts || {});
  const url = buildFsUrl(targetName, opts || {});
  return ["curl \\", " -H \"x-awtsmoos-api-key: " + (apiKey || "PASTE_API_KEY_HERE") + "\" \\", " \"" + url + "\""].join("\n");
}
