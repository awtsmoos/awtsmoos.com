// B"H

import { getJson } from "./http.js";
import { b64Json, b64Text } from "../lib/base64.js";
import { authHeaders, getActiveApiKey } from "./keySession.js";
import { log } from "../logger.js";

const SESSION_OK_ACTIONS = new Set([
  "configGet", "configSet", "roots", "rootBrowse", "rootSelect", "openRoot",
  "aiAgentList", "aiAgentSetProviderKey", "aiAgentRemoveProviderKey", "aiAgentMessage",
  "chromeFind", "chromeLaunch", "chromeStatus", "chromeNavigate",
  "chromeWaitForSelector", "chromeClick", "chromeType", "chromeEval", "chromeRunScript"
]);

/**
 * B"H
 * Chapter 335: The Browser Gate Learned The Names Of The Delegates.
 *
 * Query strings are the little rivers by which the dashboard speaks to the
 * local tunnel. Here, AI-agent messages, provider keys, models, systems, and
 * message arrays receive their own encoded vessels.
 */
function setNum(u, name, value) {
  if (value !== undefined && value !== null && value !== "") u.searchParams.set(name, String(value));
}

function setText(u, name, value) {
  if (value !== undefined && value !== null && value !== "") u.searchParams.set(name + "64", b64Text(value));
}

function setJson(u, name, value) {
  if (value !== undefined && value !== null) u.searchParams.set(name + "64", b64Json(value));
}

export function buildFsUrl(tunnelName, opts = {}) {
  const u = new URL("/api/tunnel/control/fs/" + encodeURIComponent(tunnelName), location.origin);
  u.searchParams.set("action", opts.action || "list");
  u.searchParams.set("p", opts.path || opts.p || ".");
  if (opts.absolutePath) u.searchParams.set("absolutePath", opts.absolutePath);
  setNum(u, "depth", opts.depth); setNum(u, "limit", opts.limit); setNum(u, "maxChars", opts.maxChars);
  setNum(u, "totalMaxChars", opts.totalMaxChars); setNum(u, "maxFiles", opts.maxFiles);
  setNum(u, "offsetChars", opts.offsetChars); setNum(u, "maxBytes", opts.maxBytes); setNum(u, "offsetBytes", opts.offsetBytes);
  setText(u, "content", opts.content); setJson(u, "paths", opts.paths); setJson(u, "files", opts.files); setJson(u, "writes", opts.writes);
  setText(u, "find", opts.find); setText(u, "replace", opts.replace);
  if (typeof opts.regex === "boolean") u.searchParams.set("regex", String(opts.regex));
  if (typeof opts.replaceAll === "boolean") u.searchParams.set("replaceAll", String(opts.replaceAll));
  for (const key of ["root", "local", "relay", "setTunnelName", "shell", "cwd", "url", "selector", "chromePath", "userDataDir", "provider", "providerId", "agent", "agentId", "model"]) if (opts[key]) u.searchParams.set(key, opts[key]);
  for (const key of ["allowWrite", "allowSecrets", "enableLocalHttpProxy", "allowCommands", "stream"]) if (typeof opts[key] === "boolean") u.searchParams.set(key, String(opts[key]));
  setJson(u, "tools", opts.tools); setJson(u, "chrome", opts.chrome); setJson(u, "commandConfig", opts.commandConfig); setJson(u, "aiAgents", opts.aiAgents); setJson(u, "messages", opts.messages);
  setText(u, "command", opts.command); setText(u, "text", opts.text); setText(u, "expression", opts.expression); setText(u, "apiKey", opts.apiKey); setText(u, "message", opts.message); setText(u, "prompt", opts.prompt); setText(u, "system", opts.system);
  setNum(u, "timeoutMs", opts.timeoutMs); setNum(u, "port", opts.port);
  if (typeof opts.script === "string") setText(u, "script", opts.script); else setJson(u, "script", opts.script);
  setJson(u, "input", opts.input);
  return u.toString();
}

export async function callFs(tunnelName, opts) {
  const action = opts.action || "list";
  const url = buildFsUrl(tunnelName, opts);
  const apiKey = await getActiveApiKey();
  log("callFs", { action, tunnelName, url, hasApiKey: !!apiKey });
  if (!apiKey && !SESSION_OK_ACTIONS.has(action)) {
    return { BH: "B\"H", ok: false, error: "missing_active_api_key", message: "Create, paste, or select an API key first. File and terminal actions need API key or equivalent OAuth scope.", needed: action.startsWith("command") ? "tunnel.command" : "tunnel.read/tunnel.write" };
  }
  const headers = apiKey ? await authHeaders() : {};
  return await getJson(url, { headers, credentials: "include" });
}

export async function buildCurl(tunnelName, opts) {
  const apiKey = await getActiveApiKey();
  const url = buildFsUrl(tunnelName, opts);
  return ["curl \\", " -H \"x-awtsmoos-api-key: " + (apiKey || "PASTE_API_KEY_HERE") + "\" \\", " \"" + url + "\""].join("\n");
}
