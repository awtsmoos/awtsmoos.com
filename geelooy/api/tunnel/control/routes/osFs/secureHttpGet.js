// B"H
// Boruch Hashem
// Blessed is He
"use strict";

const dns = require("node:dns").promises;
const http = require("node:http");
const https = require("node:https");
const net = require("node:net");

const MAX_BYTES = 2_000_000;
const MAX_TIMEOUT_MS = 30_000;
const MAX_REDIRECTS = 3;
const denied4 = new net.BlockList();
const denied6 = new net.BlockList();
const public6 = new net.BlockList();
public6.addSubnet("2000::", 3, "ipv6");
for (const [subnet, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10],
  ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12],
  ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16],
  ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4]
]) denied4.addSubnet(subnet, prefix, "ipv4");
for (const [subnet, prefix] of [
  ["::", 128], ["::1", 128], ["::ffff:0:0", 96],
  ["fc00::", 7], ["fe80::", 10], ["ff00::", 8],
  ["2001:db8::", 32], ["2001::", 32], ["2002::", 16],
  ["64:ff9b::", 96]
]) denied6.addSubnet(subnet, prefix, "ipv6");

/** Validate a public URL before DNS resolution. No credentials, internal names or custom ports. */
function parsePublicUrl(value) {
  let url;
  try { url = new URL(String(value || "")); }
  catch { throw new Error("HTTP_GET_INVALID_URL"); }
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("HTTP_GET_SCHEME_DENIED");
  if (url.username || url.password) throw new Error("HTTP_GET_CREDENTIAL_URL_DENIED");
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host || host.length > 253 || host.endsWith(".") ||
    /(^|\.)(localhost|local|internal|invalid|test)$/.test(host) ||
    (!net.isIP(host) && !host.includes("."))) {
    throw new Error("HTTP_GET_HOST_DENIED");
  }
  if (url.port && url.port !== (url.protocol === "https:" ? "443" : "80")) {
    throw new Error("HTTP_GET_PORT_DENIED");
  }
  if (net.isIP(host) && !isPublicAddress(host)) throw new Error("HTTP_GET_ADDRESS_DENIED");
  url.hash = "";
  return url;
}

function isPublicAddress(value) {
  const family = net.isIP(value);
  if (family === 4) return !denied4.check(value, "ipv4");
  if (family === 6) return public6.check(value, "ipv6") && !denied6.check(value, "ipv6");
  return false;
}

/** Resolve and pin an authorized public address so a later DNS rebinding cannot redirect the TCP socket. */
async function pinAddress(url, lookup = dns.lookup) {
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const results = net.isIP(host)
    ? [{ address: host, family: net.isIP(host) }]
    : await lookup(host, { all: true, verbatim: true });
  if (!Array.isArray(results) || !results.length ||
    results.some(({ address }) => !isPublicAddress(address))) {
    throw new Error("HTTP_GET_ADDRESS_DENIED");
  }
  return results.find(({ family }) => family === 4) || results[0];
}

function forwardedHeaders(value = {}) {
  const permitted = new Set(["accept", "accept-language", "user-agent"]);
  const clean = { Accept: "application/json, text/plain, */*" };
  for (const [key, data] of Object.entries(value || {})) {
    if (!permitted.has(key.toLowerCase()) || typeof data !== "string" || data.length > 512 || /[\r\n]/.test(data)) {
      continue;
    }
    clean[key] = data;
  }
  return clean;
}

/** One GET, with pinned DNS, timeout, redirect checks, bounded content and no ambient proxy authority. */
function requestOnce(url, address, headers, timeoutMs, maxBytes) {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;
    let settled = false;
    const complete = value => { if (!settled) { settled = true; resolve(value); } };
    const fail = error => { if (!settled) { settled = true; reject(error); } };
    const req = transport.request(url, {
      method: "GET",
      headers,
      agent: false,
      timeout: timeoutMs,
      lookup(host, options, callback) {
        const original = url.hostname.replace(/^\[|\]$/g, "");
        if (host !== original) return callback(new Error("HTTP_GET_HOST_CHANGED"));
        if (options?.all) return callback(null, [address]);
        return callback(null, address.address, address.family);
      }
    }, res => {
      const status = Number(res.statusCode || 0);
      if ([301, 302, 303, 307, 308].includes(status) && res.headers.location) {
        res.resume();
        return complete({ redirect: new URL(res.headers.location, url).toString() });
      }
      const chunks = [];
      let bytes = 0;
      res.on("data", chunk => {
        if (settled) return;
        const remaining = Math.max(0, maxBytes - bytes);
        if (chunk.length > remaining) {
          if (remaining) chunks.push(chunk.subarray(0, remaining));
          bytes += remaining;
          complete({ status, bytes, body: Buffer.concat(chunks).toString("utf8"), truncated: true,
            headers: { "content-type": res.headers["content-type"] || "" } });
          req.destroy();
          return;
        }
        chunks.push(chunk);
        bytes += chunk.length;
      });
      res.on("end", () => complete({ status, bytes, body: Buffer.concat(chunks).toString("utf8"), truncated: false,
        headers: { "content-type": res.headers["content-type"] || "" } }));
      res.on("error", fail);
    });
    req.on("timeout", () => req.destroy(new Error("HTTP_GET_TIMEOUT")));
    req.on("error", fail);
    req.end();
  });
}

/** Real hosted-OS GET; never report a synthetic 200 for an unexecuted request. */
async function secureHttpGet(payload = {}, options = {}) {
  const timeoutMs = Math.min(MAX_TIMEOUT_MS, Math.max(100, Number(payload.timeoutMs) || 15_000));
  const maxBytes = Math.min(MAX_BYTES, Math.max(1, Number(payload.maxBytes) || MAX_BYTES));
  const lookup = options.lookup || dns.lookup;
  const request = options.request || requestOnce;
  const headers = forwardedHeaders(payload.headers);
  try {
    let location = payload.url;
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
      const url = parsePublicUrl(location);
      const pinned = await pinAddress(url, lookup);
      const result = await request(url, pinned, headers, timeoutMs, maxBytes);
      if (result.redirect) {
        if (redirects >= MAX_REDIRECTS) throw new Error("HTTP_GET_REDIRECT_LIMIT");
        location = result.redirect;
        continue;
      }
      return { ok: true, action: "httpGet", status: result.status, headers: result.headers,
        body: result.body, bytes: result.bytes, truncated: result.truncated, redirects,
        url: url.origin + url.pathname };
    }
    throw new Error("HTTP_GET_REDIRECT_LIMIT");
  } catch (error) {
    return { ok: false, action: "httpGet", error: /^HTTP_GET_/.test(error.message) ? error.message : "HTTP_GET_REQUEST_FAILED",
      truncated: false };
  }
}

module.exports = { MAX_BYTES, MAX_TIMEOUT_MS, forwardedHeaders, isPublicAddress, parsePublicUrl, pinAddress, secureHttpGet };
