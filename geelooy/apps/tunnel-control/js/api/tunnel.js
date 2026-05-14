
// B"H

import { getJson } from "./http.js";
import { b64Json, b64Text } from "../lib/base64.js";

export function buildFsUrl(tunnelName, opts = {}) {
  const u = new URL("/api/tunnel/fs/" + encodeURIComponent(tunnelName), location.origin);

  u.searchParams.set("action", opts.action || "list");
  u.searchParams.set("p", opts.path || ".");

  if (opts.depth) u.searchParams.set("depth", String(opts.depth));
  if (opts.limit) u.searchParams.set("limit", String(opts.limit));
  if (opts.maxChars) u.searchParams.set("maxChars", String(opts.maxChars));
  if (opts.content !== undefined) u.searchParams.set("content64", b64Text(opts.content));
  if (opts.paths) u.searchParams.set("paths64", b64Json(opts.paths));
  if (opts.files) u.searchParams.set("files64", b64Json(opts.files));

  return u.toString();
}

export async function callFs(tunnelName, opts) {
  return await getJson(buildFsUrl(tunnelName, opts));
}

export async function tunnelStatus() {
  const [status, clients] = await Promise.all([
    getJson("/api/tunnel/status"),
    getJson("/api/tunnel/clients")
  ]);

  return { status, clients };
}
