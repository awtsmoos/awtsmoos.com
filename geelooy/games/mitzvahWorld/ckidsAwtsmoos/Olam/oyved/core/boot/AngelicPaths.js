// B"H
/** Worker boot paths, aimed at the public Olam gate and utility vessel. */
export const ANGELIC_PATHS = Object.freeze({
  OLAM_CORE:"../../../index.js",
  UNIVERSAL_UTILS:"../../../../utils.js"
});
export const ANGELIC_PATH_DIAGNOSTICS = Object.freeze({
  OLAM_CORE:"ckidsAwtsmoos/Olam/index.js",
  UNIVERSAL_UTILS:"ckidsAwtsmoos/utils.js"
});
export function resolveAngelicPath(relativePath) {
  try { return new URL(relativePath, import.meta.url).href; }
  catch { return relativePath; }
}
