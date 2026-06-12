// B"H
/**
 * @file importMapRefs.js
 * @description
 * Chapter 95: The Import Map Became A Lantern.
 */
function refsFromImportMaps(text = "") {
  const refs = [];
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const match of String(text || "").matchAll(scriptPattern)) {
    if (!/type\s*=\s*["']?importmap["']?/i.test(match[1] || "")) continue;
    try {
      const parsed = JSON.parse(match[2] || "{}");
      collectMapRecord(parsed.imports, refs);
      for (const scope of Object.values(parsed.scopes || {})) collectMapRecord(scope, refs);
    } catch (_) {}
  }
  return [...new Set(refs)];
}

function collectMapRecord(record, refs) {
  for (const value of Object.values(record || {})) {
    if (typeof value === "string") refs.push(value);
  }
}

module.exports = { refsFromImportMaps, collectMapRecord };
