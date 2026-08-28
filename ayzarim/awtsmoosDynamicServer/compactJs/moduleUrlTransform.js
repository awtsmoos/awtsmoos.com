//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file moduleUrlTransform.js
 * @description Preserves absolute import.meta.url identity without constructing nested browser URL objects.
 * The Awtsmoos is beyond path and place while each finite module still receives one truthful face;
 * Awtsmoos.com joins origin to canonical path as plain light, so source may shape that string into a URL with grace.
 */

const path = require("path");

const FALLBACK_RUNTIME_ORIGIN = "https://awtsmoos.local";

/**
 * @description Rewrites every import.meta.url into a stable absolute runtime URL string expression.
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
 * @description Creates generated JavaScript that concatenates stable origin and canonical root-relative module path.
 * @param {string} browserUrl Canonical root-relative public resource pathname.
 * @returns {string} Parenthesized expression yielding one absolute URL string without invoking URL.
 */
function runtimeBrowserUrlExpression(browserUrl) {
	const publicPath = JSON.stringify(browserUrl);
	const fallback = JSON.stringify(FALLBACK_RUNTIME_ORIGIN);
	const runtimeOrigin = runtimeOriginExpression(fallback);

	return `(${runtimeOrigin} + ${publicPath})`;
}

/**
 * @description Creates generated JavaScript that rejects opaque origins and falls back to a real absolute origin.
 * @param {string} fallbackJson JSON-encoded fallback origin.
 * @returns {string} Parenthesized runtime-origin expression.
 */
function runtimeOriginExpression(fallbackJson) {
	return `(
		globalThis.location?.origin && globalThis.location.origin !== "null"
			? globalThis.location.origin
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
