
// B"H

function normalizeDynamicReturn(dyn) {
  if (dyn === undefined) {
    return {
      mimeType: "awtsmoos/undefined",
      body: "undefined"
    };
  }

  if (dyn === null) {
    return {
      mimeType: "awtsmoos/null",
      body: "null"
    };
  }

  if (dyn && typeof dyn === "object" && dyn.response !== undefined) {
    return {
      mimeType: dyn.mimeType || dyn.contentType || "",
      statusCode: dyn.statusCode,
      body: dyn.response,
      headers: dyn.headers || {}
    };
  }

  return {
    mimeType: "",
    body: dyn,
    headers: {}
  };
}

function stringifyBody(body) {
  if (Buffer.isBuffer(body)) return body;

  if (body && typeof body === "object") {
    return JSON.stringify(body);
  }

  if (body === undefined) return "undefined";
  if (body === null) return "null";

  return String(body);
}

module.exports = {
  normalizeDynamicReturn,
  stringifyBody
};
