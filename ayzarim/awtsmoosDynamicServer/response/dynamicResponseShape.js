
// B"H

function isPlainObject(x) {
  return !!x && typeof x === "object" && !Buffer.isBuffer(x) && !Array.isArray(x);
}

function isWrappedDynamicResponse(x) {
  if (!isPlainObject(x)) return false;

  return (
    x.response !== undefined ||
    x.mimeType !== undefined ||
    x.contentType !== undefined ||
    x.statusCode !== undefined ||
    x.headers !== undefined ||
    x.redirect !== undefined
  );
}

function makeDynamicResponse({
  statusCode = 200,
  headers = {},
  mimeType = "",
  response = ""
} = {}) {
  return {
    statusCode,
    headers,
    mimeType,
    response
  };
}

function makeJsonResponse(obj, statusCode = 200) {
  return makeDynamicResponse({
    statusCode,
    mimeType: "application/json; charset=utf-8",
    headers: {
      "Cache-Control": "no-store"
    },
    response: JSON.stringify(obj, null, 2)
  });
}

function makeHtmlResponse(html, statusCode = 200) {
  return makeDynamicResponse({
    statusCode,
    mimeType: "text/html; charset=utf-8",
    headers: {
      "Cache-Control": "no-store"
    },
    response: String(html)
  });
}

function makeRedirectResponse(to, fallbackHtml) {
  return makeDynamicResponse({
    statusCode: 302,
    mimeType: "text/html; charset=utf-8",
    headers: {
      Location: String(to),
      "Cache-Control": "no-store"
    },
    response: fallbackHtml || "Redirecting to " + String(to)
  });
}

module.exports = {
  isPlainObject,
  isWrappedDynamicResponse,
  makeDynamicResponse,
  makeJsonResponse,
  makeHtmlResponse,
  makeRedirectResponse
};
