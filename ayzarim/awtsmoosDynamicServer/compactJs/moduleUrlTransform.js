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
 * On file: protocol the origin is unusable (Chrome reports "file://" and root-relative
 * paths are meaningless), so the base is derived from the bundle's own import.meta.url
 * by stripping the game-root anchor; http(s) origins keep the historical behavior.
 * @param {string} browserUrl Canonical root-relative public resource pathname.
 * @returns {string} Parenthesized expression yielding one absolute URL string without invoking URL.
 */
function runtimeBrowserUrlExpression(browserUrl) {
	const publicPath = JSON.stringify(browserUrl);
	const fallback = JSON.stringify(FALLBACK_RUNTIME_ORIGIN);
	const runtimeOrigin = runtimeOriginExpression(fallback, browserUrl);

	return `(${runtimeOrigin} + ${publicPath})`;
}

/**
 * @description Creates generated JavaScript that rejects opaque and non-http(s) origins,
 * resolving file: URLs against the bundle's real location instead of a fake origin.
 * @param {string} fallbackJson JSON-encoded fallback origin.
 * @param {string} browserUrl Canonical root-relative public resource pathname.
 * @returns {string} Parenthesized runtime-origin expression.
 */
function runtimeOriginExpression(fallbackJson, browserUrl) {
	const anchor = JSON.stringify(
		`/${String(browserUrl || '').split('/').filter(Boolean).slice(0, 2).join('/')}/`
	);
	return `(
		globalThis.location?.protocol === "file:"
			? ${fileBaseExpression(anchor, fallbackJson)}
			: (/^(https?):\\/\\//.test(globalThis.location?.origin || "")
				? globalThis.location.origin
				: ${fallbackJson})
	)`.replace(/\n\s*/g, ' ');
}

/**
 * @description Creates the file: branch: slice the bundle's real import.meta.url at the
 * game-root anchor so root-relative public paths resolve to true file URLs.
 * @param {string} anchorJson JSON-encoded game-root anchor with trailing slash.
 * @param {string} fallbackJson JSON-encoded fallback origin when the anchor is absent.
 * @returns {string} Parenthesized file-base expression.
 */
function fileBaseExpression(anchorJson, fallbackJson) {
	return `(import.meta.url.lastIndexOf(${anchorJson}) > 8 ? import.meta.url.slice(0, import.meta.url.lastIndexOf(${anchorJson})) : ${fallbackJson})`;
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
	fileBaseExpression,
	rewriteImportMetaUrl,
	runtimeBrowserUrlExpression
};
