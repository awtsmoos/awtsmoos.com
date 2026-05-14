
// B"H

function stripQueryAndHash(value) {
  return String(value || "").split("?")[0].split("#")[0];
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}

function normalizeRoutePath(value) {
  let s = safeDecode(stripQueryAndHash(value));

  s = s.replace(/\\/g, "/");
  s = s.replace(/\/+/g, "/");
  s = s.trim();

  if (s === "." || s === "") return "";

  s = s.replace(/^\/+/, "");
  s = s.replace(/\/+$/, "");

  return s;
}

function splitPath(value) {
  const clean = normalizeRoutePath(value);
  return clean ? clean.split("/").filter(Boolean) : [];
}

module.exports = {
  stripQueryAndHash,
  safeDecode,
  normalizeRoutePath,
  splitPath
};
