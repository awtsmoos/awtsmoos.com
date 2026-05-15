
// B"H

import { getJson } from "./http.js";
import { b64Json, b64Text } from "../lib/base64.js";
import { authHeaders, getActiveApiKey } from "./keySession.js";
import { log } from "../logger.js";

const SESSION_OK_ACTIONS = new Set([
  "configGet",
  "configSet",
  "roots",
  "rootBrowse",
  "rootSelect",
  "openRoot",
  "chromeFind",
  "chromeLaunch",
  "chromeStatus",
  "chromeNavigate",
  "chromeWaitForSelector",
  "chromeClick",
  "chromeType",
  "chromeEval",
  "chromeRunScript"
]);

/**
 * B"H
 * Writes a numeric query param if present.
 *
 * @param {URL} u URL object.
 * @param {string} name Param name.
 * @param {unknown} value Param value.
 * @returns {void}
 */
function setNum(u, name, value) {
  if (value !== undefined && value !== null && value !== "") {
    u.searchParams.set(name, String(value));
  }
}

/**
 * B"H
 * Builds the tunnel control URL.
 *
 * @param {string} tunnelName Active tunnel name.
 * @param {object} opts Action options.
 * @returns {string} URL string.
 */
export function buildFsUrl(tunnelName, opts = {}) {
  const u = new URL(
    "/api/tunnel/control/fs/" + encodeURIComponent(tunnelName),
    location.origin
  );

  u.searchParams.set("action", opts.action || "list");
  u.searchParams.set("p", opts.path || opts.p || ".");

  if (opts.absolutePath) u.searchParams.set("absolutePath", opts.absolutePath);
  setNum(u, "depth", opts.depth);
  setNum(u, "limit", opts.limit);
  setNum(u, "maxChars", opts.maxChars);
  setNum(u, "totalMaxChars", opts.totalMaxChars);
  setNum(u, "maxFiles", opts.maxFiles);
  setNum(u, "offsetChars", opts.offsetChars);
  setNum(u, "maxBytes", opts.maxBytes);
  setNum(u, "offsetBytes", opts.offsetBytes);

  if (opts.content !== undefined) u.searchParams.set("content64", b64Text(opts.content));
  if (opts.paths) u.searchParams.set("paths64", b64Json(opts.paths));
  if (opts.files) u.searchParams.set("files64", b64Json(opts.files));
  if (opts.writes) u.searchParams.set("writes64", b64Json(opts.writes));
  if (opts.find !== undefined) u.searchParams.set("find64", b64Text(opts.find));
  if (opts.replace !== undefined) u.searchParams.set("replace64", b64Text(opts.replace));
  if (typeof opts.regex === "boolean") u.searchParams.set("regex", String(opts.regex));
  if (typeof opts.replaceAll === "boolean") u.searchParams.set("replaceAll", String(opts.replaceAll));

  if (opts.root) u.searchParams.set("root", opts.root);
  if (opts.local) u.searchParams.set("local", opts.local);
  if (opts.relay) u.searchParams.set("relay", opts.relay);
  if (opts.setTunnelName) u.searchParams.set("setTunnelName", opts.setTunnelName);

  if (typeof opts.allowWrite === "boolean") u.searchParams.set("allowWrite", String(opts.allowWrite));
  if (typeof opts.allowSecrets === "boolean") u.searchParams.set("allowSecrets", String(opts.allowSecrets));
  if (typeof opts.enableLocalHttpProxy === "boolean") {
    u.searchParams.set("enableLocalHttpProxy", String(opts.enableLocalHttpProxy));
  }
  if (typeof opts.allowCommands === "boolean") {
    u.searchParams.set("allowCommands", String(opts.allowCommands));
  }

  if (opts.tools) u.searchParams.set("tools64", b64Json(opts.tools));
  if (opts.chrome) u.searchParams.set("chrome64", b64Json(opts.chrome));
  if (opts.commandConfig) u.searchParams.set("commandConfig64", b64Json(opts.commandConfig));
  if (opts.command) u.searchParams.set("command64", b64Text(opts.command));
  if (opts.shell) u.searchParams.set("shell", opts.shell);
  if (opts.cwd) u.searchParams.set("cwd", opts.cwd);
  setNum(u, "timeoutMs", opts.timeoutMs);

  if (opts.url) u.searchParams.set("url", opts.url);
  if (opts.selector) u.searchParams.set("selector", opts.selector);
  if (opts.text !== undefined) u.searchParams.set("text64", b64Text(opts.text));
  if (opts.expression) u.searchParams.set("expression64", b64Text(opts.expression));
  if (typeof opts.script === "string") {
    u.searchParams.set("script64", b64Text(opts.script));
  } else if (opts.script) {
    u.searchParams.set("script64", b64Json(opts.script));
  }
  if (opts.input) u.searchParams.set("input64", b64Json(opts.input));

  setNum(u, "port", opts.port);
  if (opts.chromePath) u.searchParams.set("chromePath", opts.chromePath);
  if (opts.userDataDir) u.searchParams.set("userDataDir", opts.userDataDir);

  return u.toString();
}

/**
 * B"H
 * Calls the tunnel control endpoint.
 *
 * Chrome actions are intentionally allowed through logged-in browser
 * session because the control panel itself is the trusted surface.
 *
 * @param {string} tunnelName Active tunnel name.
 * @param {object} opts Action options.
 * @returns {Promise<object>} JSON response.
 */
export async function callFs(tunnelName, opts) {
  const action = opts.action || "list";
  const url = buildFsUrl(tunnelName, opts);
  const apiKey = await getActiveApiKey();

  log("callFs", { action, tunnelName, url, hasApiKey: !!apiKey });

  if (!apiKey && !SESSION_OK_ACTIONS.has(action)) {
    return {
      BH: "B\"H",
      ok: false,
      error: "missing_active_api_key",
      message:
        "Create, paste, or select an API key first. Setup, root picker, and Chrome control work with login. File and terminal actions need API key or equivalent OAuth scope.",
      needed:
        action.startsWith("chrome")
          ? "tunnel.browser"
          : action.startsWith("command")
            ? "tunnel.command"
            : "tunnel.read/tunnel.write"
    };
  }

  const headers = apiKey ? await authHeaders() : {};
  return await getJson(url, { headers, credentials: "include" });
}

/**
 * B"H
 * Builds a curl example.
 *
 * @param {string} tunnelName Tunnel name.
 * @param {object} opts Action options.
 * @returns {Promise<string>} Curl string.
 */
export async function buildCurl(tunnelName, opts) {
  const apiKey = await getActiveApiKey();
  const url = buildFsUrl(tunnelName, opts);

  return [
    "curl \\",
    " -H \"x-awtsmoos-api-key: " + (apiKey || "PASTE_API_KEY_HERE") + "\" \\",
    " \"" + url + "\""
  ].join("\n");
}
