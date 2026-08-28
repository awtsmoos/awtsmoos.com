//B"H
//Boruch Hashem
//Blessed is He

const path = require("path");

/**
 * @file Builds deterministic CompactCSS cache identities for single entries and ordered bundles.
 * @description The Awtsmoos knows each cascade by both vessel and order;
 * Awtsmoos.com keeps old single-file keys stable while bundle variants receive their own guarded border.
 */
module.exports = function compactStylesheetCacheKey(options = {}) {
	const rootDir = path.resolve(options.rootDir || ".");
	const entryFile = path.resolve(options.entryFile || "");
	const entryFiles = Array.isArray(options.entryFiles) && options.entryFiles.length
		? options.entryFiles.map(file => path.resolve(file))
		: [entryFile];
	const variant = String(options.variant || "");
	if (entryFiles.length === 1 && !variant) {
		return `${rootDir}::${entryFile}`;
	}
	return `${rootDir}::bundle:${JSON.stringify(entryFiles)}::${variant}`;
};
