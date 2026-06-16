// B"H
/**
 * @file respond.js
 * @brief Safe response shaping for tunnel-control dynamic routes.
 *
 * Chapter 457: The gate learned humility after the river had already flowed.
 * Some proxy and streaming paths commit headers before late error shaping runs.
 * These helpers must therefore never throw when headers are already sent; they
 * return a body for normal routes, and an empty vessel for already-committed
 * routes so the surrounding router does not crash with ERR_HTTP_HEADERS_SENT.
 */

function responseOf($i = {}) {
  return $i.response || $i.res || null;
}

function headersAlreadySent(response) {
  return Boolean(response?.headersSent || response?.writableEnded || response?.finished);
}

function canMutateHeaders(response) {
  return Boolean(response && !headersAlreadySent(response));
}

function setStatus($i, status) {
  const response = responseOf($i);
  if (!canMutateHeaders(response)) return false;
  try {
    response.statusCode = status;
    return true;
  } catch (_e) {
    return false;
  }
}

function setHeader($i, name, value) {
  const response = responseOf($i);
  if (!canMutateHeaders(response)) return false;
  try {
    response.setHeader(name, value);
    return true;
  } catch (_e) {
    return false;
  }
}

function bodyOrEmpty($i, body) {
  return headersAlreadySent(responseOf($i)) ? "" : String(body);
}

function json($i, data, status = 200) {
  setStatus($i, status);
  setHeader($i, "Content-Type", "application/json; charset=utf-8");
  return bodyOrEmpty($i, JSON.stringify(data, null, 2));
}

function html($i, text, status = 200) {
  setStatus($i, status);
  setHeader($i, "Content-Type", "text/html; charset=utf-8");
  return bodyOrEmpty($i, text);
}

function text($i, body, mime = "text/plain; charset=utf-8", status = 200) {
  setStatus($i, status);
  setHeader($i, "Content-Type", mime);
  return bodyOrEmpty($i, body);
}

module.exports = {
  bodyOrEmpty,
  canMutateHeaders,
  headersAlreadySent,
  html,
  json,
  setHeader,
  setStatus,
  text
};
