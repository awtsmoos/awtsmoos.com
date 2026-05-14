
// B"H

import { getJson } from "./http.js";
import { b64Json, b64Text } from "../lib/base64.js";
import { authHeaders, getActiveApiKey } from "./keySession.js";

/**
 * B"H
 * Builds the protected tunnel-control filesystem URL.
 * The URL alone is not enough anymore; calls also need x-awtsmoos-api-key
 * or OAuth bearer token. The hosted app sends x-awtsmoos-api-key.
 */
export function buildFsUrl(tunnelName, opts = {}) {
  const u = new URL("/api/tunnel/control/fs/" + encodeURIComponent(tunnelName), location.origin);

  u.searchParams.set("action", opts.action || "list");
  u.searchParams.set("p", opts.path || ".");

  if (opts.depth) u.searchParams.set("depth", String(opts.depth));
  if (opts.limit) u.searchParams.set("limit", String(opts.limit));
  if (opts.maxChars) u.searchParams.set("maxChars", String(opts.maxChars));
  if (opts.content !== undefined) u.searchParams.set("content64", b64Text(opts.content));
  if (opts.paths) u.searchParams.set("paths64", b64Json(opts.paths));
  if (opts.files) u.searchParams.set("files64", b64Json(opts.files));

  if (opts.root) u.searchParams.set("root", opts.root);
  if (opts.local) u.searchParams.set("local", opts.local);
  if (opts.relay) u.searchParams.set("relay", opts.relay);
  if (opts.setTunnelName) u.searchParams.set("setTunnelName", opts.setTunnelName);
  if (typeof opts.allowWrite === "boolean") u.searchParams.set("allowWrite", String(opts.allowWrite));
  if (typeof opts.allowSecrets === "boolean") u.searchParams.set("allowSecrets", String(opts.allowSecrets));
  if (typeof opts.enableLocalHttpProxy === "boolean") u.searchParams.set("enableLocalHttpProxy", String(opts.enableLocalHttpProxy));
  if (opts.tools) u.searchParams.set("tools64", b64Json(opts.tools));

  return u.toString();
}

export async function callFs(tunnelName, opts) {
  const apiKey = await getActiveApiKey();

  if (!apiKey) {
    return {
      BH: "B\"H",
      ok: false,
      error: "missing_active_api_key",
      message: "Create or select an API key first. Debug/session-only tunnel calls are disabled."
    };
  }

  return await getJson(buildFsUrl(tunnelName, opts), {
    headers: await authHeaders()
  });
}

export async function buildCurl(tunnelName, opts) {
  const apiKey = await getActiveApiKey();
  const url = buildFsUrl(tunnelName, opts);

  return [
    "curl \\",
    "  -H \"x-awtsmoos-api-key: " + (apiKey || "PASTE_API_KEY_HERE") + "\" \\",
    "  \"" + url + "\""
  ].join("\n");
}
