// B"H
/**
 * @file ModuleUrlResolver.js
 * @description Canonical worker boot URL resolver for the uppercase Olam tree.
 */

export const OLAM_BOOT_CANONICAL_SEAL = "worker-module-olam-index-fix-20260708-bh6";

const CASE_FIXES = Object.freeze([
  ["/games/mitzvahWorld/ckidsAwtsmoos/olam/", "/games/mitzvahWorld/ckidsAwtsmoos/Olam/"],
  ["/geelooy/games/mitzvahWorld/ckidsAwtsmoos/olam/", "/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/"]
]);

/**
 * B"H
 * Fixes only the URL pathname segment that can break case-sensitive servers.
 *
 * @param {string} pathname Pathname or path-like text.
 * @returns {string} Uppercase-safe Olam pathname.
 */
export function canonicalizeOlamPathname(pathname) {
  let out = String(pathname || "");
  for (const [bad, good] of CASE_FIXES) out = out.replace(bad, good);
  return out;
}

/**
 * B"H
 * Canonicalizes an absolute or path-like URL while preserving query and hash.
 *
 * @param {string|URL} input URL to repair.
 * @returns {string} URL with `/ckidsAwtsmoos/Olam/` preserved.
 */
export function canonicalizeOlamUrl(input) {
  const text = String(input || "");
  try {
    const url = new URL(text);
    url.pathname = canonicalizeOlamPathname(url.pathname);
    return url.href;
  } catch {
    return canonicalizeOlamPathname(text);
  }
}

/**
 * B"H
 * Resolves a module relative to this boot layer, then repairs Olam casing.
 *
 * @param {string} relativePath Relative module path from the boot directory.
 * @returns {string} Fully resolved canonical URL.
 */
export function resolveModuleUrl(relativePath) {
  return canonicalizeOlamUrl(new URL(relativePath, import.meta.url));
}

/**
 * B"H
 * Builds a stable cache key after canonicalization, never before it.
 *
 * @param {string} url Module URL.
 * @returns {string} Path and search suitable for diagnostics and tests.
 */
export function canonicalModuleCacheKey(url) {
  const canonical = canonicalizeOlamUrl(url);
  try {
    const parsed = new URL(canonical);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return canonical;
  }
}

/**
 * B"H
 * Resolves a ledger row into the exact import URL and diagnostic metadata.
 *
 * @param {{key:string,label:string,relativePath:string,expectedEnd:string,requiredExport?:string}} record Module row.
 * @returns {{key:string,label:string,relativePath:string,expectedEnd:string,requiredExport:string,url:string,cacheKey:string,caseCanonicalized:boolean}}
 */
export function resolveModuleRecord(record) {
  const url = resolveModuleUrl(record.relativePath);
  return {
    key: record.key,
    label: record.label,
    relativePath: record.relativePath,
    expectedEnd: canonicalizeOlamPathname(record.expectedEnd),
    requiredExport: record.requiredExport || "default",
    url,
    cacheKey: canonicalModuleCacheKey(url),
    caseCanonicalized: url.includes("/ckidsAwtsmoos/Olam/")
  };
}
