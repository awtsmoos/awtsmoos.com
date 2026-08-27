
// B"H
const { safeJson } = require("./safeJson.js");

function shouldJsonParse(value) {
  if (typeof value !== "string") return false;

  const text = value.trim();
  if (!text) return false;

  if (text.startsWith("{") || text.startsWith("[")) return true;

  if (
    text === "true" ||
    text === "false" ||
    text === "null"
  ) {
    return true;
  }

  return false;
}

function parseOne(value) {
  if (Array.isArray(value)) {
    return value.map(parseOne);
  }

  if (!shouldJsonParse(value)) {
    return value;
  }

  const parsed = safeJson(value, undefined);
  return parsed === undefined ? value : parsed;
}

function parseUrlEncodedBody(bodyBuffer, querystring) {
  const text = bodyBuffer.toString("utf8");
  const parsed = querystring.parse(text);

  for (const key of Object.keys(parsed)) {
    parsed[key] = parseOne(parsed[key]);
  }

  return parsed;
}

module.exports = { parseUrlEncodedBody };
