// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moduleUrlTransform.js
 * @description
 * Preserves absolute `import.meta.url` meaning when CompactJS carries source
 * modules into a browser-facing generated garment.
 *
 * RESPONSIBILITY:
 * Derive canonical public resource paths and lower module URL identity into
 * an absolute runtime URL expression.
 *
 * NON-RESPONSIBILITY:
 * This module does not parse AST nodes, rewrite imports or exports, traverse
 * module graphs, or choose compact representation URLs.
 *
 * The Awtsmoos is beyond pathname and origin while each finite module still
 * needs an honest place in the world. Awtsmoos.com joins public path to the
 * living browser location so compact light stays valid, bright, and unfurled.
 */

const path = require("path");

const FALLBACK_RUNTIME_ORIGIN = "https://awtsmoos.local/";

/**
 * Rewrites every `import.meta.url` into an absolute runtime URL expression.
 *
 * @param {string} source
 * 	Transformed module body source.
 * @param {string} browserUrl
 * 	Canonical root-relative public resource pathname.
 * @returns {string}
 * 	Source whose module URL references remain valid absolute URLs at runtime.
 */
function rewriteImportMetaUrl(source, browserUrl) {
	const runtimeExpression = runtimeBrowserUrlExpression(browserUrl);
	return String(source || "").replace(
		/\bimport\.meta\.url\b/g,
		runtimeExpression
	);
}

/**
 * Creates generated JavaScript that resolves one public path at runtime.
 *
 * @param {string} browserUrl
 * 	Canonical root-relative public resource pathname.
 * @returns {string}
 * 	Parenthesized expression yielding an absolute URL string.
 */
function runtimeBrowserUrlExpression(browserUrl) {
	const publicPath = JSON.stringify(browserUrl);
	const fallback = JSON.stringify(FALLBACK_RUNTIME_ORIGIN);
	return `(
		new URL(
			${publicPath},
			globalThis.location?.href || ${fallback}
		).href
	)`.replace(/\n\s*/g, " ");
}

/**
 * Returns the canonical public pathname for one real source module record.
 *
 * @param {object} state
 * 	Compact compiler graph state containing `rootDir`.
 * @param {object} record
 * 	Parsed module record containing `filePath`.
 * @returns {string}
 * 	Root-relative browser pathname using forward slashes.
 */
function browserUrlForRecord(state, record) {
	const relative = path.relative(
		state.rootDir,
		record.filePath
	);
	return `/${relative.split(path.sep).join("/")}`;
}

module.exports = {
	browserUrlForRecord,
	rewriteImportMetaUrl,
	runtimeBrowserUrlExpression
};
