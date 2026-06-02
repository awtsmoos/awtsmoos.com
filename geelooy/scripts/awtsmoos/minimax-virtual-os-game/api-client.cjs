// B"H
/**
 * @file api-client.cjs
 * @description
 * Chapter 4: The public API is the only mouth the workers use.
 *
 * Every Virtual OS operation here goes through `/api/tunnel/control/fs/awtsmoos-virtual-os`
 * with x-awtsmoos-api-key. GET is used for ordinary small calls. POST is used
 * only when content is large enough that a query-string vessel would shatter.
 */

const { DEFAULT_BASE_URL } = require("./config.cjs");

function endpoint(baseUrl, action, pathValue) {
  const url = new URL("/api/tunnel/control/fs/awtsmoos-virtual-os", baseUrl || DEFAULT_BASE_URL);
  url.searchParams.set("action", action);
  url.searchParams.set("p", pathValue || ".");
  return url;
}

function decodeBufferJson(text) {
  try {
    const parsed = JSON.parse(String(text || ""));
    if (parsed && parsed.type === "Buffer" && Array.isArray(parsed.data)) {
      return Buffer.from(parsed.data).toString("utf8");
    }
  } catch (_e) {}
  return text;
}

function normalizeReadResult(json) {
  if (typeof json.content === "string") {
    return { ...json, content: decodeBufferJson(json.content) };
  }
  return json;
}

function shouldPost(content) {
  return typeof content === "string" && content.length > 900;
}

async function callVirtualOs({ apiKey, action, path, content, baseUrl, extra = {} }) {
  const url = endpoint(baseUrl, action, path);
  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const headers = { "x-awtsmoos-api-key": apiKey };
  const init = { method: "GET", headers };

  if (content !== undefined && shouldPost(content)) {
    init.method = "POST";
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify({ action, p: path, path, content, ...extra });
  } else if (content !== undefined) {
    url.searchParams.set("content", content);
  }

  const response = await fetch(url, init);
  const text = await response.text();
  let json;
  try { json = JSON.parse(text); }
  catch (_e) { json = { ok: false, text }; }
  json = normalizeReadResult(json);

  if (!response.ok || json.ok === false) {
    const message = json.error || json.message || `HTTP ${response.status}`;
    throw new Error(`${action} ${path || "."} failed: ${message}`);
  }
  return json;
}

async function writeVirtualFile(apiKey, virtualPath, content, baseUrl) {
  return await callVirtualOs({ apiKey, action: "write", path: virtualPath, content, baseUrl });
}

async function readVirtualFile(apiKey, virtualPath, baseUrl) {
  return await callVirtualOs({ apiKey, action: "read", path: virtualPath, baseUrl });
}

async function listVirtualPath(apiKey, virtualPath = ".", baseUrl) {
  return await callVirtualOs({ apiKey, action: "list", path: virtualPath, baseUrl });
}

module.exports = { callVirtualOs, listVirtualPath, readVirtualFile, writeVirtualFile };
