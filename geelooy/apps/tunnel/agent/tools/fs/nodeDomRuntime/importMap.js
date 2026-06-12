// B"H
const { cleanKey } = require("./publicPath.js");

/**
 * B"H
 * Import maps are document-root vows, not importer-relative whispers. A mapped
 * value like ./src/x.js resolves from the HTML/public root; ordinary relative
 * imports still resolve from the importing module.
 */
function mergeImportMaps(plan = {}) {
  const imports = {};
  for (const item of plan.importMaps || []) Object.assign(imports, item.parsed?.imports || {});
  return imports;
}

function resolveImport(spec, from, imports = {}) {
  const mapped = imports[spec] || prefixMap(spec, imports);
  if (mapped) return cleanKey(mapped);
  const chosen = spec;
  if (/^[a-z]+:\/\//i.test(chosen) || chosen.startsWith("/")) return cleanKey(chosen);
  if (!chosen.startsWith(".")) return cleanKey(chosen);
  return resolveRelative(chosen, from);
}

function resolveRelative(spec, from) {
  const base = cleanKey(from).split("/").slice(0, -1).join("/");
  const stack = (base ? base + "/" : "") + spec;
  const out = [];
  for (const part of stack.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") out.pop(); else out.push(part);
  }
  return cleanKey(out.join("/"));
}

function prefixMap(spec, imports) {
  for (const [key, value] of Object.entries(imports || {})) {
    if (key.endsWith("/") && spec.startsWith(key)) return String(value) + spec.slice(key.length);
  }
  return null;
}
module.exports = { mergeImportMaps, resolveImport, prefixMap, resolveRelative };
