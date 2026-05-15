// B"H
const http = require("http");
const https = require("https");
const fsp = require("fs/promises");
const path = require("path");
const { safePath } = require("../pathGuard.js");
const { cookieHeader, storeSetCookies } = require("./httpCookieJar.js");

/**
 * B"H
 * Extracts repeated set-cookie headers across Node versions.
 *
 * @param {object} headers Response headers.
 * @returns {string[]} Set-Cookie lines.
 */
function setCookieLines(headers) {
  const raw = headers["set-cookie"];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}


/**
 * B"H
 * Makes one native HTTP/HTTPS request with bounded body capture.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @param {number} redirectCount Current redirect count.
 * @returns {Promise<object>} Response.
 */
async function requestOnce(config, payload = {}, redirectCount = 0) {
  const url = new URL(payload.url);
  const lib = url.protocol === "https:" ? https : http;
  const maxBytes = Math.max(1, Math.min(Number(payload.maxBytes || 1024 * 1024), 20 * 1024 * 1024));
  const timeoutMs = Math.max(1000, Math.min(Number(payload.timeoutMs || 30000), 240000));
  const headers = { ...(payload.headers || {}) };
  const jarName = payload.cookieJarName || payload.jar || "default";

  if (payload.useCookies !== false) {
    const cookies = await cookieHeader(jarName, url);
    if (cookies && !headers.Cookie && !headers.cookie) headers.Cookie = cookies;
  }

  const body = payload.body ? Buffer.from(String(payload.body), payload.bodyEncoding || "utf8") : null;
  if (body && !headers["Content-Length"] && !headers["content-length"]) headers["Content-Length"] = body.length;

  return await new Promise((resolve, reject) => {
    const req = lib.request(url, {
      method: payload.method || "GET",
      headers,
      timeout: timeoutMs
    }, res => {
      const chunks = [];
      let bytes = 0;
      let truncated = false;

      res.on("data", chunk => {
        bytes += chunk.length;
        if (bytes <= maxBytes) chunks.push(chunk);
        else truncated = true;
      });

      res.on("end", async () => {
        try {
          const responseHeaders = res.headers;
          const setCookies = setCookieLines(responseHeaders);

          if (payload.saveCookies !== false && setCookies.length) {
            await storeSetCookies(jarName, setCookies, url);
          }

          const location = responseHeaders.location;
          const shouldRedirect = [301, 302, 303, 307, 308].includes(res.statusCode) && location && payload.followRedirects !== false;

          if (shouldRedirect && redirectCount < Number(payload.maxRedirects || 5)) {
            const nextUrl = new URL(location, url).toString();
            const nextPayload = {
              ...payload,
              url: nextUrl,
              method: res.statusCode === 303 ? "GET" : payload.method,
              body: res.statusCode === 303 ? "" : payload.body
            };
            resolve(await requestOnce(config, nextPayload, redirectCount + 1));
            return;
          }

          const buffer = Buffer.concat(chunks);
          let savedPath = null;

          if (payload.saveResponseTo) {
            const full = safePath(config, payload.saveResponseTo);
            await fsp.mkdir(path.dirname(full), { recursive: true });
            await fsp.writeFile(full, buffer);
            savedPath = full;
          }

          const asBase64 = payload.responseBodyMode === "base64";
          const omit = payload.responseBodyMode === "none" || !!payload.saveResponseTo;

          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 400,
            action: "httpRequest",
            url: payload.url,
            finalUrl: url.toString(),
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: responseHeaders,
            redirects: redirectCount,
            bytes,
            capturedBytes: buffer.length,
            truncated,
            savedPath,
            body: omit || asBase64 ? "" : buffer.toString(payload.responseEncoding || "utf8"),
            body64: omit || !asBase64 ? "" : buffer.toString("base64"),
            setCookieCount: setCookies.length
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("timeout", () => req.destroy(new Error("HTTP timeout after " + timeoutMs + "ms")));
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

/**
 * B"H
 * Performs a native HTTP request.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Response.
 */
async function httpRequest(config, payload = {}) {
  if (!payload.url) return { ok: false, action: "httpRequest", error: "missing_url" };
  return await requestOnce(config, payload, 0);
}

/**
 * B"H
 * Performs a native HTTP request and parses the response body as JSON.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} JSON response.
 */
async function httpJson(config, payload = {}) {
  const res = await httpRequest(config, { ...payload, responseBodyMode: "text" });

  try {
    return {
      ...res,
      action: "httpJson",
      json: JSON.parse(res.body || "null"),
      jsonValid: true
    };
  } catch (e) {
    return {
      ...res,
      action: "httpJson",
      jsonValid: false,
      jsonError: e.message
    };
  }
}


/**
 * B"H
 * Downloads a URL directly to a local file.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Download response.
 */
async function httpDownload(config, payload = {}) {
  if (!payload.to && !payload.saveResponseTo) return { ok: false, action: "httpDownload", error: "missing_to" };
  const res = await httpRequest(config, {
    ...payload,
    saveResponseTo: payload.to || payload.saveResponseTo,
    responseBodyMode: "none"
  });
  return { ...res, action: "httpDownload" };
}

module.exports = { httpRequest, httpJson, httpDownload };
