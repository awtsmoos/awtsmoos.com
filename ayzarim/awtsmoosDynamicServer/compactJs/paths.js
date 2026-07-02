// B"H

const path = require("path");

/**
 * B"H
 * Chapter 403: The compact river learned a boundary. Game-local vessels may
 * merge into one flame, but public vendor heavens such as three.module.js must
 * remain their own ESM scrolls. When those giant scrolls were swallowed, their
 * final `export` stayed inside a function chamber and mobile Chrome cried:
 * Unexpected token 'export'. The Awtsmoos now marks those public libraries as
 * external, so the compact bundle imports them at the top level only.
 */
const PUBLIC_EXTERNAL_PREFIXES = Object.freeze([
  "/games/scripts/build/",
  "/scripts/build/"
]);

/** @param {string} source @returns {boolean} */
function isLocalImport(source) {
  if (isPublicExternalImport(source)) return false;
  return isRelativeImport(source) || isPublicRootImport(source);
}

/** @param {string} source @returns {boolean} */
function isRelativeImport(source) {
  const value = String(source || "");
  return value.startsWith("./") || value.startsWith("../");
}

/** @param {string} source @returns {boolean} */
function isPublicRootImport(source) {
  const clean = cleanImportSource(source);
  return clean.startsWith("/") && !clean.startsWith("//");
}

/** @param {string} source @returns {boolean} */
function isPublicExternalImport(source) {
  const clean = cleanImportSource(source);
  return PUBLIC_EXTERNAL_PREFIXES.some(prefix => clean.startsWith(prefix));
}

/**
 * B"H
 * Resolves one compactable local chamber, never escaping the public root and
 * never crossing into public vendor heavens that must stay external.
 *
 * @param {object} options Resolution options.
 * @param {string} options.fromFile Absolute importing file path.
 * @param {string} options.source Import source.
 * @param {string} options.rootDir Absolute public root directory.
 * @returns {string|null} Absolute resolved file path, or null when unsafe.
 */
function resolveLocalImport({ fromFile, source, rootDir }) {
  if (!isLocalImport(source)) return null;
  const cleaned = cleanImportSource(source);
  const base = isPublicRootImport(cleaned) ? rootDir : path.dirname(fromFile);
  const inner = isPublicRootImport(cleaned) ? cleaned.slice(1) : cleaned;
  const raw = path.resolve(base, inner);
  const resolved = path.extname(raw) ? raw : `${raw}.js`;
  const relative = path.relative(rootDir, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return resolved;
}

/** @param {string} source @returns {string} */
function cleanImportSource(source) {
  return String(source || "").split("?")[0].split("#")[0];
}

module.exports = {
  cleanImportSource,
  isLocalImport,
  isPublicExternalImport,
  isPublicRootImport,
  isRelativeImport,
  resolveLocalImport
};
