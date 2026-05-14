
// B"H

function bodyFromActualResponse(ar) {
  if (Buffer.isBuffer(ar)) return ar;
  if (ar && Buffer.isBuffer(ar.content)) return ar.content;
  if (ar && ar.content !== undefined) return ar.content;
  return ar;
}

function stringifyBody(body) {
  if (Buffer.isBuffer(body)) return body;
  if (body && typeof body === "object") return JSON.stringify(body);
  if (body === undefined) return "undefined";
  if (body === null) return "null";
  return String(body);
}

function applyHeaders(response, res, ar) {
  if (res.statusCode) {
    response.statusCode = res.statusCode;
  }

  response.setHeader("Vary", "Cookie");

  if (res.headers && typeof res.headers === "object") {
    for (const [k, v] of Object.entries(res.headers)) {
      if (v !== undefined && v !== null) {
        response.setHeader(k, String(v));
      }
    }
  }

  if (res.responseType) {
    response.setHeader("Content-Type", res.responseType);
  } else if (ar && ar.contentType) {
    response.setHeader("Content-Type", ar.contentType + "; charset=utf-8");
  }
}

function sendAwtsmoosResponse({ response, res }) {
  if (!res) return false;

  const ar = res.actualResponse;

  if (!ar) return false;

  applyHeaders(response, res, ar);

  const body = stringifyBody(bodyFromActualResponse(ar));
  response.end(body);

  return true;
}

module.exports = {
  sendAwtsmoosResponse
};
