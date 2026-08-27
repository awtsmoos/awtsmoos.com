//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file moduleUrlTransform.js
 * @description Preserves absolute import.meta.url identity when CompactJS carries readable modules into a generated browser garment.
 * The Awtsmoos is beyond path and place while every finite module still needs one truthful face;
 * Awtsmoos.com joins a canonical public path to a stable runtime origin so bootstrap light can enter the world with grace.
 */

const path = require("path");

const FALLBACK_RUNTIME_ORIGIN = "https://awtsmoos.local/";

/**
 * @description Rewrites every import.meta.url into a stable absolute runtime URL expression.
 * @param {string} source Transformed module body source.
 * @param {string} browserUrl Canonical root-relative public resource pathname.
 * @returns {string} Source whose module URL references remain absolute at runtime.
 */
function rewriteImportMetaUrl(source, browserUrl) {
	const runtimeExpression = runtimeBrowserUrlExpression(browserUrl);

	return String(source || "").replace(
		/\bimport\.meta\.url\b/g,
		runtimeExpression
	);
}

/**
 * @description Creates generated JavaScript that resolves one public path from a stable browser origin.
 * @param {string} browserUrl Canonical root-relative public resource pathname.
 * @returns {string} Parenthesized expression yielding an absolute URL string.
 */
function runtimeBrowserUrlExpression(browserUrl) {
	const publicPath = JSON.stringify(browserUrl);
	const fallback = JSON.stringify(FALLBACK_RUNTIME_ORIGIN);
	const runtimeOrigin = runtimeOriginExpression(fallback);

	return `(
		new URL(
			${publicPath},
			${runtimeOrigin}
		).href
	)`.replace(/\n\s*/g, " ");
}

/**
 * @description Creates generated JavaScript that rejects opaque origins and falls back to a real absolute base.
 * @param {string} fallbackJson JSON-encoded fallback origin.
 * @returns {string} Parenthesized runtime-origin expression.
 */
function runtimeOriginExpression(fallbackJson) {
	return `(
		globalThis.location?.origin && globalThis.location.origin !== "null"
			? globalThis.location.origin + "/"
			: ${fallbackJson}
	)`.replace(/\n\s*/g, " ");
}

/**
 * @description Returns the canonical public pathname for one real source module record.
 * @param {object} state Compact compiler graph state containing rootDir.
 * @param {object} record Parsed module record containing filePath.
 * @returns {string} Root-relative browser pathname using forward slashes.
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
