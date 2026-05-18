//B"H
#!/usr/bin/env node
import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.AWTSMOOS_AI_RELAY_PORT || process.env.PORT || 3847);
const HOST = process.env.AWTSMOOS_AI_RELAY_HOST || "127.0.0.1";
const MAX_BODY = 25 * 1024 * 1024;
const jar = new Map();

/**
 * A tiny local relay for Awtsmoos AI Cockpit.
 * It keeps cookies per upstream origin, streams response bodies, and exposes
 * one clean fetch-shaped endpoint to the browser when the Chrome extension is
 * absent, late, or blocked by page isolation.
 */
const server = http.createServer(async (req, res) => {
  try {
    applyCors(res);
    if (req.method === "OPTIONS") return res.writeHead(204).end();

    const url = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);
    if (url.pathname === "/health") {
      return json(res, 200, { ok: true, name: "awtsmoos-ai-relay", port: PORT, cookieOrigins: jar.size });
    }

    if (url.pathname !== "/fetch" || req.method !== "POST") {
      return json(res, 404, { ok: false, error: "Use POST /fetch or GET /health." });
    }

    const payload = await readJson(req);
    const target = new URL(String(payload.url || ""));
    if (!/^https?:$/.test(target.protocol)) throw new Error("Only http/https targets are allowed.");

    const upstreamHeaders = normalizeHeaders(payload.options?.headers || {});
    const cookieHeader = cookieStringFor(target.origin);
    if (cookieHeader && !hasHeader(upstreamHeaders, "cookie")) upstreamHeaders.cookie = cookieHeader;

    const init = {
      method: payload.options?.method || "GET",
      headers: upstreamHeaders,
      redirect: payload.options?.redirect || "follow"
    };
    if (payload.options?.body != null && !/^(GET|HEAD)$/i.test(init.method)) init.body = payload.options.body;

    const upstream = await fetch(target, init);
    absorbCookies(target.origin, upstream.headers);

    const headers = filterResponseHeaders(upstream.headers);
    headers.set("x-awtsmoos-relay", "1");
    headers.set("x-awtsmoos-upstream-url", upstream.url);
    headers.set("access-control-expose-headers", "x-awtsmoos-relay,x-awtsmoos-upstream-url,content-type");

    res.writeHead(upstream.status, Object.fromEntries(headers.entries()));
    if (!upstream.body) return res.end();

    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) res.write(Buffer.from(value));
    }
    res.end();
  } catch (error) {
    json(res, 500, { ok: false, error: error?.message || String(error), stack: error?.stack || "" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`B"H Awtsmoos AI relay listening at http://${HOST}:${PORT}`);
  console.log("Use from the browser: http://127.0.0.1:3847/health");
});

function applyCors(res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type,authorization,x-awtsmoos-relay");
}

function json(res, status, data) {
  applyCors(res);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", chunk => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("Relay request body too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
      catch (error) { reject(error); }
    });
    req.on("error", reject);
  });
}

function normalizeHeaders(input) {
  if (Array.isArray(input)) return Object.fromEntries(input);
  const out = {};
  for (const [key, value] of Object.entries(input || {})) {
    if (value == null) continue;
    const low = key.toLowerCase();
    if (["host", "origin", "referer", "content-length"].includes(low)) continue;
    out[low] = String(value);
  }
  return out;
}

function hasHeader(headers, name) {
  return Object.keys(headers).some(key => key.toLowerCase() === name.toLowerCase());
}

function filterResponseHeaders(headers) {
  const out = new Headers();
  for (const [key, value] of headers.entries()) {
    const low = key.toLowerCase();
    if (["set-cookie", "set-cookie2", "content-encoding", "transfer-encoding", "connection"].includes(low)) continue;
    out.set(key, value);
  }
  return out;
}

function absorbCookies(origin, headers) {
  const raw = getSetCookie(headers);
  if (!raw.length) return;
  const bucket = jar.get(origin) || new Map();
  for (const line of raw) {
    const first = line.split(";")[0];
    const eq = first.indexOf("=");
    if (eq > 0) bucket.set(first.slice(0, eq).trim(), first.slice(eq + 1).trim());
  }
  jar.set(origin, bucket);
}

function cookieStringFor(origin) {
  const bucket = jar.get(origin);
  if (!bucket?.size) return "";
  return [...bucket.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function getSetCookie(headers) {
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const one = headers.get("set-cookie");
  if (!one) return [];
  return splitSetCookie(one);
}

function splitSetCookie(value) {
  return String(value).split(/,(?=\s*[^;=]+=[^;]+)/g).map(x => x.trim()).filter(Boolean);
}
