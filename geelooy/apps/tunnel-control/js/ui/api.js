
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

function addValue(u, key, value) {
  if (value === undefined || value === null || value === "") return;
  u.searchParams.set(key, String(value));
}

function addBool(u, key, value) {
  if (value === true || value === false) u.searchParams.set(key, String(value));
}

function add64(u, key, value) {
  if (value === undefined || value === null) return;
  u.searchParams.set(key, b64(value));
}

function addJson64(u, key, value) {
  if (value === undefined || value === null) return;
  u.searchParams.set(key, b64(JSON.stringify(value)));
}

export function fsUrl(opts = {}) {
  const u = new URL("/api/tunnel/control/fs/" + encodeURIComponent(tunnelName()), location.origin);

  addValue(u, "action", opts.action || "list");

  [
    "p", "path", "absolutePath", "root", "local", "relay", "depth", "limit",
    "maxChars", "totalMaxChars", "maxFiles", "offsetChars", "maxBytes",
    "offsetBytes", "shell", "cwd", "timeoutMs", "url", "selector", "port",
    "chromePath", "userDataDir"
  ].forEach(key => addValue(u, key, opts[key]));

  [
    "allowWrite", "allowSecrets", "allowCommands", "enableLocalHttpProxy",
    "regex", "replaceAll"
  ].forEach(key => addBool(u, key, opts[key]));

  add64(u, "content64", opts.content);
  add64(u, "find64", opts.find);
  add64(u, "replace64", opts.replace);
  add64(u, "query64", opts.query);
  add64(u, "command64", opts.command);
  add64(u, "script64", opts.scriptText);
  add64(u, "text64", opts.text);
  add64(u, "expression64", opts.expression);

  addJson64(u, "paths64", opts.paths);
  addJson64(u, "files64", opts.files);
  addJson64(u, "writes64", opts.writes);
  addJson64(u, "edits64", opts.edits);
  addJson64(u, "script64", opts.script);
  addJson64(u, "input64", opts.input);
  addJson64(u, "tools64", opts.tools);
  addJson64(u, "chrome64", opts.chrome);
  addJson64(u, "commandConfig64", opts.commandConfig);

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

  try {
    const json = JSON.parse(text);
    if (json && json.type === "TUNNEL_RESPONSE") json.ok = json.ok !== false;
    return json;
  } catch (e) {
    return { ok: false, status: res.status, raw: text };
  }
}

export function humanError(value) {
  if (!value) return "unknown error";
  if (typeof value === "string") return value;
  if (value.error) return humanError(value.error);
  if (value.message) return humanError(value.message);

  try { return JSON.stringify(value); }
  catch (e) { return String(value); }
}

export function show(id, value) {
  const el = $(id);
  if (!el) return;

  try { el.textContent = JSON.stringify(value, null, 2); }
  catch (e) { el.textContent = String(value); }
}

export async function apiGet(path) {
  const res = await fetch(path, {
    credentials: "include",
    headers: authHeaders({ Accept: "application/json" })
  });

  return await res.json();
}

export async function apiPostForm(path, data) {
  const body = new URLSearchParams();

  for (const [k, v] of Object.entries(data || {})) {
    body.set(k, String(v ?? ""));
  }

  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: authHeaders({
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    }),
    body
  });

  return await res.json();
}
