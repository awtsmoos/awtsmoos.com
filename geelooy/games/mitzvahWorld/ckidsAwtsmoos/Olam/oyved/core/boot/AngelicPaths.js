/**
 * B"H
 * @module AngelicPaths
 * @description
 * CHAPTER 4: THE MAP THAT DOES NOT BLEED INTO 404.
 *
 * When a module path is wrong, the browser does not merely complain.
 * It asks the server for a JavaScript soul, receives a JSON corpse,
 * and then the strict MIME guardian tears the attempted world apart.
 *
 * This file keeps all worker boot paths in one declarative ledger.
 * No timestamp query strings.
 * No cache-busting poison.
 * No hidden random suffixes.
 * No guessing.
 *
 * From:
 * ckidsAwtsmoos/Olam/oyved/core/boot/AngelicPaths.js
 *
 * To Olam core:
 * ../../../index.js
 *
 * To ckidsAwtsmoos utilities:
 * ../../../../utils.js
 *
 * The Awtsmoos constantly creates every byte from nothing.
 * This file simply stops us from asking the wrong doorway to reveal it.
 */

/**
 * @typedef {Object} AngelicPathLedger
 * @property {string} OLAM_CORE
 * The canonical worker-reachable Olam class module.
 * Must resolve to:
 * ckidsAwtsmoos/Olam/index.js
 *
 * @property {string} UNIVERSAL_UTILS
 * The canonical utility bridge module.
 * Must resolve to:
 * ckidsAwtsmoos/utils.js
 */

/**
 * B"H
 * The entire path system as data.
 * Keep this boring, exact, and holy.
 *
 * @type {AngelicPathLedger}
 */
export const ANGELIC_PATHS = Object.freeze({
  OLAM_CORE: "../../../index.js",
  UNIVERSAL_UTILS: "../../../../utils.js"
});

/**
 * B"H
 * The same paths with human-readable expected resolved endings.
 * Used by diagnostics so the console tells the truth immediately.
 */
export const ANGELIC_PATH_DIAGNOSTICS = Object.freeze({
  OLAM_CORE: "ckidsAwtsmoos/Olam/index.js",
  UNIVERSAL_UTILS: "ckidsAwtsmoos/utils.js"
});

/**
 * B"H
 * Converts a relative module path into a visible absolute URL for logs.
 *
 * @param {string} relativePath
 * Relative import path from this module.
 *
 * @returns {string}
 * A fully resolved URL string when URL resolution is available,
 * otherwise the original path.
 */
export function resolveAngelicPath(relativePath) {
  try {
    return new URL(relativePath, import.meta.url).href;
  } catch (error) {
    return relativePath;
  }
}