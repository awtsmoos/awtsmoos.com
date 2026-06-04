// B"H

const path = require("path");

/**
 * B"H
 * A local import is a thread inside the served public garment. Relative paths
 * walk from the importing file. Slash-rooted paths walk from the public root —
 * the same chamber the server builds as directory + mainDir, usually geelooy.
 * Bare imports remain external, because package maps and CDNs are different
 * heavens and should not be guessed by this compact server path.
 *
 * @param {string} source Import source string.
 * @returns {boolean} True for local relative or public-root imports.
 */
function isLocalImport(source) {
  return isRelativeImport(source) || isPublicRootImport(source);
}

/**
 * B"H
 * Relative imports are born beside the importing file.
 *
 * @param {string} source Import source string.
 * @returns {boolean} True for ./ or ../ imports.
 */
function isRelativeImport(source) {
  return source.startsWith("./") || source.startsWith("../");
}

/**
 * B"H
 * Public-root imports begin with one slash, but not protocol-relative URLs.
 *
 * @param {string} source Import source string.
 * @returns {boolean} True for /scripts/foo.js style imports.
 */
function isPublicRootImport(source) {
  return source.startsWith("/") && !source.startsWith("//");
}

/**
 * B"H
 * Resolves the next JavaScript chamber without escaping the public root. The
 * Awtsmoos draws a boundary around the served tree and calls it mercy.
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

/**
 * B"H
 * Query strings and hashes are browser ornaments, not filesystem chambers.
 *
 * @param {string} source Import source string.
 * @returns {string} Import source without query/hash.
 */
function cleanImportSource(source) {
  return String(source || "").split("?")[0].split("#")[0];
}

module.exports = {
  cleanImportSource,
  isLocalImport,
  isPublicRootImport,
  isRelativeImport,
  resolveLocalImport
};
