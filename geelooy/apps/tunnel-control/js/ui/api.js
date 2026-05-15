
// B"H
import { $ } from "./dom.js";

const b64 = value => btoa(unescape(encodeURIComponent(String(value ?? ""))));

export function tunnelName() {
  return ($("tunnelName")?.value || "").trim();
}

function apiKey() {
  return localStorage.getItem("awtTunnelApiKey") || "";
}

function authHeaders(extra = {}) {
  const key = apiKey();
  return key ? { ...extra, "x-awtsmoos-api-key": key } : extra;
}

export function fsUrl(opts = {}) {
  const u = new URL("/api/tunnel/control/fs/" + encodeURIComponent(tunnelName()), location.origin);
  u.searchParams.set("action", opts.action || "list");

  const direct = ["p", "path", "absolutePath", "root", "depth", "limit", "maxChars",
    "totalMaxChars", "maxFiles", "offsetChars", "shell", "cwd", "timeoutMs",
    "url", "selector", "port", "chromePath", "userDataDir"];

  for (const key of direct) {
    if (opts[key] !== undefined && opts[key] !== null && opts[key] !== "") {
      u.searchParams.set(key, String(opts[key]));
    }
  }

  if (opts.content !== undefined) u.searchParams.set("content64", b64(opts.content));
  if (opts.command !== undefined) u.searchParams.set("command64", b64(opts.command));
  if (opts.scriptText !== undefined) u.searchParams.set("script64", b64(opts.scriptText));
  if (opts.text !== undefined) u.searchParams.set("text64", b64(opts.text));
  if (opts.expression !== undefined) u.searchParams.set("expression64", b64(opts.expression));
  if (opts.paths) u.searchParams.set("paths64", b64(JSON.stringify(opts.paths)));
  if (opts.files) u.searchParams.set("files64", b64(JSON.stringify(opts.files)));
  if (opts.script) u.searchParams.set("script64", b64(JSON.stringify(opts.script)));
  if (opts.tools) u.searchParams.set("tools64", b64(JSON.stringify(opts.tools)));
  if (opts.chrome) u.searchParams.set("chrome64", b64(JSON.stringify(opts.chrome)));
  if (opts.commandConfig) u.searchParams.set("commandConfig64", b64(JSON.stringify(opts.commandConfig)));

  return u.toString();
}

export async function callFs(opts) {
  const url = fsUrl(opts);
  if ($("actionUrlOut")) $("actionUrlOut").textContent = url;

  const res = await fetch(url, {
    credentials: "include",
    headers: authHeaders({ Accept: "application/json" })
  });

  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { ok: false, status: res.status, raw: text }; }
}

export async function apiGet(path) {
  const res = await fetch(path, { credentials: "include", headers: authHeaders({ Accept: "application/json" }) });
  return await res.json();
}

export async function apiPostForm(path, data) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(data || {})) body.set(k, String(v ?? ""));
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: authHeaders({ Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" }),
    body
  });
  return await res.json();
}

export function show(id, value) {
  const el = $(id);
  if (!el) return;
  try { el.textContent = JSON.stringify(value, null, 2); }
  catch { el.textContent = String(value); }
}
