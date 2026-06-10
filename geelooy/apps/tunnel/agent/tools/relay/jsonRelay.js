// B"H

/**
 * Chapter 3: Jason Stood Beside JSON And Became A Separate Gate.
 *
 * The user asked for Jason separately; this vessel accepts both names and keeps
 * JSON relay independent from ChatGPT cookies, Chrome, and stream cursors.
 *
 * @param {{url:string,options?:object,method?:string,headers?:object,body?:any}} payload Relay request.
 * @returns {Promise<object>} Parsed JSON response with status metadata.
 */
async function jsonRelay(payload = {}) {
  const target = new URL(payload.url || payload.href || "");
  if (!["http:", "https:"].includes(target.protocol)) throw new Error("json_relay_requires_http_url");
  const options = payload.options || {};
  const method = payload.method || options.method || "GET";
  const headers = { accept: "application/json", ...(options.headers || {}), ...(payload.headers || {}) };
  const response = await fetch(target, { method, headers, body: encodeBody(payload.body ?? options.body), cache: "no-store" });
  const text = await response.text();
  return { ok: response.ok, status: response.status, url: response.url, headers: Array.from(response.headers.entries()), json: parseJson(text), text };
}

function encodeBody(body) {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string" || Buffer.isBuffer(body)) return body;
  return JSON.stringify(body);
}

function parseJson(text) {
  try { return text ? JSON.parse(text) : null; }
  catch (error) { return { parseError: error.message }; }
}

module.exports = { jsonRelay };
