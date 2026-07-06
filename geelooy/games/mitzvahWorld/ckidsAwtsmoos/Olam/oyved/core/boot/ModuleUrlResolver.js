// B"H
/**
 * @file ModuleUrlResolver.js
 * Canonicalizes worker boot URLs so a lowercase-loaded worker cannot poison
 * Olam core imports into /ckidsAwtsmoos/olam/... on case-sensitive servers.
 */
const CASE_FIXES = Object.freeze([
  ["/games/mitzvahWorld/ckidsAwtsmoos/olam/", "/games/mitzvahWorld/ckidsAwtsmoos/Olam/"],
  ["/geelooy/games/mitzvahWorld/ckidsAwtsmoos/olam/", "/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/"]
]);

export function canonicalizeOlamUrl(url) {
  let out = String(url || "");
  for (const [bad, good] of CASE_FIXES) out = out.replace(bad, good);
  return out;
}

export function resolveModuleUrl(relativePath) {
  return canonicalizeOlamUrl(new URL(relativePath, import.meta.url).href);
}

export function resolveModuleRecord(record) {
  const url = resolveModuleUrl(record.relativePath);
  return {
    key: record.key,
    label: record.label,
    relativePath: record.relativePath,
    expectedEnd: record.expectedEnd,
    requiredExport: record.requiredExport || "default",
    url,
    caseCanonicalized: url.includes("/ckidsAwtsmoos/Olam/")
  };
}
