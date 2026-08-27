//B"H

/**
 * Chapter 2: The Cup That Never Steals The Wine.
 *
 * These response helpers are small vessels: they pour bytes, JSON, and HTML
 * without hiding side effects. Localhost is same-origin for the mirrored app,
 * but some browser-created Request objects still arrive wearing CORS garments;
 * the helper answers those garments plainly so the river does not die early.
 *
 * @param {import('http').ServerResponse} res HTTP response.
 * @param {number} status Status code.
 * @param {string|Buffer} body Body to send.
 * @param {Record<string,string|string[]>} headers Extra headers.
 * @returns {void}
 */
function send(res, status, body = "", headers = {}) {
  res.writeHead(status, { ...corsHeaders(), ...headers });
  res.end(body);
}

/** @returns {Record<string,string>} */
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400"
  };
}

/** @param {import('http').ServerResponse} res @param {unknown} value */
function json(res, value, status = 200) {
  send(res, status, JSON.stringify(value), { "Content-Type": "application/json" });
}

/** @param {import('http').ServerResponse} res @param {string} html */
function html(res, html) {
  send(res, 200, html, { "Content-Type": "text/html; charset=utf-8" });
}

/** @param {import('http').IncomingMessage} req */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = { send, json, html, readBody, corsHeaders };
