/**
 * B"H
 * @module AngelicPaths
 * @description Worker boot path ledger, pointing at the active tested Olam gate.
 */
export const ANGELIC_PATHS = Object.freeze({
  OLAM_CORE: "../../../index.js?compact=true&v=actual-tested-live-gates-20260709-bh5",
  UNIVERSAL_UTILS: "../../../../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1"
});
export const ANGELIC_PATH_DIAGNOSTICS = Object.freeze({
  OLAM_CORE: "ckidsAwtsmoos/Olam/index.js?actual-tested-live-gates-20260709-bh5",
  UNIVERSAL_UTILS: "ckidsAwtsmoos/utils.js"
});
export function resolveAngelicPath(relativePath) {
  try { return new URL(relativePath, import.meta.url).href; }
  catch { return relativePath; }
}
