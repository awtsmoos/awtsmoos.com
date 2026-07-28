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
 * Resolves one compactable local chamber with browser URL semantics. Browsers
 * clamp excessive `..` traversal at the public `/` root; the filesystem must
 * mirror that rule rather than escape the configured directory or leave a
 * relative import stranded inside generated compact output.
 *
 * @param {object} options Resolution options.
 * @param {string} options.fromFile Absolute importing file path.
 * @param {string} options.source Import source.
 * @param {string} options.rootDir Absolute public root directory.
 * @returns {string|null} Absolute resolved file path, or null when unsafe.
 */
function resolveLocalImport({ fromFile, source, rootDir }) {
  if (!isLocalImport(source)) return null;
  const root = path.resolve(rootDir);
  const importingDirectory = path.dirname(path.resolve(fromFile));
  const importerRelative = path.relative(root, importingDirectory);
  if (escapesRoot(importerRelative)) return null;

  const cleaned = cleanImportSource(source);
  const publicBase = isPublicRootImport(cleaned)
    ? "/"
    : `/${slash(importerRelative)}/`;
  const publicPath = path.posix.resolve(publicBase, cleaned);
  const raw = path.resolve(root, publicPath.slice(1));
  const resolved = path.extname(raw) ? raw : `${raw}.js`;
  const relative = path.relative(root, resolved);
  return escapesRoot(relative) ? null : resolved;
}

function escapesRoot(relative) {
  return relative.startsWith("..") || path.isAbsolute(relative);
}

function slash(value) {
  return String(value || "").split(path.sep).join("/");
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
