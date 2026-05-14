
// B"H

const {
  isPlainObject,
  isWrappedDynamicResponse
} = require("./dynamicResponseShape.js");

function normalizeHeaders(headers) {
  const out = {};

  if (!headers || typeof headers !== "object") return out;

  for (const [k, v] of Object.entries(headers)) {
    if (v !== undefined && v !== null) {
      out[k] = String(v);
    }
  }

  return out;
}

function normalizeDynamicReturn(dyn) {
  if (dyn === undefined) {
    return {
      statusCode: 200,
      headers: {},
      mimeType: "text/plain; charset=utf-8",
      body: "undefined"
    };
  }

  if (dyn === null) {
    return {
      statusCode: 200,
      headers: {},
      mimeType: "text/plain; charset=utf-8",
      body: "null"
    };
  }

  if (isWrappedDynamicResponse(dyn)) {
    const headers = normalizeHeaders(dyn.headers);

    if (dyn.redirect && !headers.Location) {
      headers.Location = String(dyn.redirect);
    }

    return {
      statusCode: dyn.statusCode || dyn.status || (headers.Location ? 302 : 200),
      headers,
      mimeType: dyn.mimeType || dyn.contentType || "",
      body: dyn.response !== undefined ? dyn.response : dyn.body
    };
  }

  if (Buffer.isBuffer(dyn)) {
    return {
      statusCode: 200,
      headers: {},
      mimeType: "",
      body: dyn
    };
  }

  if (isPlainObject(dyn) || Array.isArray(dyn)) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      mimeType: "application/json; charset=utf-8",
      body: JSON.stringify(dyn, null, 2)
    };
  }

  return {
    statusCode: 200,
    headers: {},
    mimeType: "",
    body: String(dyn)
  };
}

module.exports = { normalizeDynamicReturn };
