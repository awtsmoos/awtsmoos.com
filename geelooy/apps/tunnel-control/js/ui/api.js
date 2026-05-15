
// B"H
import { $ } from "./dom.js";

const b64 = value => btoa(unescape(encodeURIComponent(String(value ?? ""))));

export function tunnelName() {
  return ($("tunnelName")?.value || "").trim();
}

export function fsUrl(opts = {}) {
  const name = encodeURIComponent(tunnelName());
  const u = new URL("/api/tunnel/control/fs/" + name, location.origin);
  u.searchParams.set("action", opts.action || "list");

  const direct = ["depth", "limit", "maxChars", "timeoutMs", "port", "url",
    "selector", "chromePath", "root", "absolutePath", "shell", "cwd"];

  if (opts.path !== undefined) u.searchParams.set("p", opts.path);
  for (const key of direct) {
    if (opts[key] !== undefined && opts[key] !== null && opts[key] !== "") {
      u.searchParams.set(key, String(opts[key]));
    }
  }

  if (opts.content !== undefined) u.searchParams.set("content64", b64(opts.content));
  if (opts.command !== undefined) u.searchParams.set("command64", b64(opts.command));
  if (opts.text !== undefined) u.searchParams.set("text64", b64(opts.text));
  if (opts.expression !== undefined) u.searchParams.set("expression64", b64(opts.expression));
  if (opts.script !== undefined) u.searchParams.set("script64", b64(opts.script));
  if (opts.paths) u.searchParams.set("paths64", b64(JSON.stringify(opts.paths)));
  if (opts.files) u.searchParams.set("files64", b64(JSON.stringify(opts.files)));

  return u.toString();
}

export async function callFs(opts) {
  const url = fsUrl(opts);
  if ($("actionUrlOut")) $("actionUrlOut").textContent = url;
  const res = await fetch(url, { credentials: "include", headers: { Accept: "application/json" } });
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { ok: false, raw: text, status: res.status }; }
}

export function show(id, value) {
  const el = $(id);
  if (!el) return;
  try { el.textContent = JSON.stringify(value, null, 2); }
  catch { el.textContent = String(value); }
}
