
// B"H
import { $ } from "./dom.js";

const b64 = value => btoa(unescape(encodeURIComponent(String(value ?? ""))));

export function tunnelName() {
  return ($("tunnelName")?.value || "").trim();
}

export function fsUrl(opts = {}) {
  const u = new URL("/api/tunnel/fs/" + encodeURIComponent(tunnelName()), location.origin);
  u.searchParams.set("action", opts.action || "list");
  const map = { path: "p", absolutePath: "absolutePath", content: "content64", command: "command64", script: "script64" };
  for (const [k, v] of Object.entries(opts)) {
    if (v === undefined || v === null || k === "action") continue;
    if (k === "content" || k === "command" || k === "script") u.searchParams.set(map[k], b64(v));
    else if (Array.isArray(v) || typeof v === "object") u.searchParams.set(k + "64", b64(JSON.stringify(v)));
    else u.searchParams.set(map[k] || k, String(v));
  }
  return u.toString();
}

export async function callFs(opts) {
  const url = fsUrl(opts);
  const actionUrlOut = $("actionUrlOut");
  if (actionUrlOut) actionUrlOut.textContent = url;
  const res = await fetch(url);
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { ok: false, raw: text }; }
}

export function show(id, value) {
  const el = $(id);
  if (!el) return;
  try { el.textContent = JSON.stringify(value, null, 2); }
  catch { el.textContent = String(value); }
}
