// B"H
const JSON_SUFFIX = ".awtsmoosJSON";

function stripJsonSuffix(value = "") {
  const text = String(value || "");
  return text.endsWith(JSON_SUFFIX) ? text.slice(0, -JSON_SUFFIX.length) : text;
}

function cleanPath(path = ".") {
  const raw = String(path || ".")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
  if (!raw || raw === ".") return ".";
  return raw.split("/").filter(Boolean).map(stripJsonSuffix).join("/");
}

function splitPath(path = ".") {
  const clean = cleanPath(path);
  if (clean === ".") return { root: true, aliasId: "", innerPath: "" };
  const parts = clean.split("/").filter(Boolean);
  return {
    root: false,
    aliasId: stripJsonSuffix(parts.shift() || ""),
    innerPath: parts.map(stripJsonSuffix).join("/")
  };
}

function dbPath(sp, aliasId, innerPath = "") {
  return `${sp}/aliases/${aliasId}/fileSystem/${innerPath || ""}`;
}

module.exports = { JSON_SUFFIX, stripJsonSuffix, cleanPath, splitPath, dbPath };
