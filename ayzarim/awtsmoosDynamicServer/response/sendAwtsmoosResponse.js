
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
  response.setHeader("Vary", "Cookie");

  if (res.headers && typeof res.headers === "object") {
    for (const [k, v] of Object.entries(res.headers)) {
      response.setHeader(k, v);
    }
  }

  if (res.statusCode) {
    response.statusCode = res.statusCode;
  }

  if (res.responseType) {
    response.setHeader("content-type", res.responseType);
  } else if (ar && ar.contentType) {
    response.setHeader("content-type", ar.contentType + "; charset=utf-8");
  }
}

function sendAwtsmoosResponse({ response, res }) {
  if (res.statusResponse) {
    response.setHeader("Awtsmoos-File-Status", "true");
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(res.actualResponse.content);
    return true;
  }

  const ar = res.actualResponse;

  if (!ar) {
    return false;
  }

  applyHeaders(response, res, ar);

  const body = stringifyBody(bodyFromActualResponse(ar));
  response.end(body);

  return true;
}

module.exports = {
  sendAwtsmoosResponse
};
