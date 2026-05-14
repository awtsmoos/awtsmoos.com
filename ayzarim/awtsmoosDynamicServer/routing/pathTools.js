
// B"H

function stripQueryAndHash(value) {
  return String(value || "").split("?")[0].split("#")[0];
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return String(value || "");
  }
}

function normalizeSlashes(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .trim();
}

function normalizeRoutePath(value) {
  let s = safeDecode(stripQueryAndHash(value));
  s = normalizeSlashes(s);

  if (!s || s === "." || s === "/") return "";

  s = s.replace(/^\/+/, "");
  s = s.replace(/\/+$/, "");

  return s;
}

function splitPath(value) {
  const clean = normalizeRoutePath(value);
  return clean ? clean.split("/").filter(Boolean) : [];
}

function routeDisplay(value) {
  const clean = normalizeRoutePath(value);
  return clean ? "/" + clean : "/";
}

module.exports = {
  stripQueryAndHash,
  safeDecode,
  normalizeSlashes,
  normalizeRoutePath,
  splitPath,
  routeDisplay
};
