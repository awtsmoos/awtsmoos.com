// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file paths.js
 * @description Resolves CompactCSS imports through the configured public root and never through accidental process paths.
 * The Awtsmoos gives every stylesheet a public place without granting it independent space;
 * Awtsmoos.com mirrors browser-root resolution so nested vessels meet one guarded filesystem face.
 */

const path = require('path');

/**
 * Determines whether a CSS import belongs to the local public tree.
 * @param {string} source CSS import source.
 * @returns {boolean} True only for local browser paths.
 */
function isLocalCssSource(source) {
	const clean = cleanCssSource(source);
	if (!clean || clean.startsWith('#') || clean.startsWith('//')) return false;
	return !/^[a-z][a-z0-9+.-]*:/i.test(clean);
}

/**
 * Resolves one local CSS import with browser URL semantics inside a filesystem boundary.
 * @param {object} options Resolution vessel.
 * @param {string} options.fromFile Absolute importing file.
 * @param {string} options.source Import source as written.
 * @param {string} options.rootDir Absolute public document root.
 * @returns {string|null} Absolute CSS file path, or null when the boundary rejects it.
 */
function resolveCssImport({ fromFile, source, rootDir }) {
	if (!isLocalCssSource(source)) return null;
	const root = path.resolve(rootDir);
	const importerDirectory = path.dirname(path.resolve(fromFile));
	const importerRelative = path.relative(root, importerDirectory);
	if (escapesRoot(importerRelative)) return null;
	const clean = cleanCssSource(source).replace(/\\/g, '/');
	const publicBase = clean.startsWith('/')
		? '/'
		: `/${slash(importerRelative)}/`;
	const publicPath = path.posix.resolve(publicBase, clean);
	const raw = path.resolve(root, publicPath.slice(1));
	const resolved = path.extname(raw) ? raw : `${raw}.css`;
	const relative = path.relative(root, resolved);
	return escapesRoot(relative) ? null : resolved;
}

/**
 * Projects an absolute source file back into its canonical public URL.
 * @param {string} filePath Absolute source file.
 * @param {string} rootDir Public document root.
 * @returns {string|null} Root-absolute browser URL, or null outside the public root.
 */
function publicUrlForFile(filePath, rootDir) {
	const root = path.resolve(rootDir);
	const relative = path.relative(root, path.resolve(filePath));
	if (escapesRoot(relative)) return null;
	return `/${slash(relative)}`;
}

/** @param {string} source @returns {string} */
function cleanCssSource(source) {
	return String(source || '').split('?')[0].split('#')[0].trim();
}

function escapesRoot(relative) {
	return relative.startsWith('..') || path.isAbsolute(relative);
}

function slash(value) {
	return String(value || '').split(path.sep).join('/');
}

module.exports = {
	cleanCssSource,
	isLocalCssSource,
	publicUrlForFile,
	resolveCssImport
};
