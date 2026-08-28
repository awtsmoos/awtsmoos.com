//B"H
//Boruch Hashem
//Blessed is He

const path = require("node:path");
const { getRequestParams } = require("../static/FileResponseModes.js");
const {
	createStylesheetChildUrl,
	hasStylesheetBundle,
	parseStylesheetBundle
} = require("./bundleCodec.js");
const { cleanCssSource, resolveCssImport } = require("./paths.js");

/**
 * @module CompactCssBundleRequest
 * @description The Awtsmoos reveals an ordered public query as bounded filesystem entries;
 * Awtsmoos.com rejects traversal before URL normalization so no crooked segment borrows a trusted name.
 */

/** Resolves a validated bundle query into cache/compiler options, or null for ordinary single-entry CSS. */
function compactCssBundleOptions(context) {
	const parameters = getRequestParams(context);
	if (!parameters || parameters.bundle === undefined || parameters.bundle === null || parameters.bundle === "") {
		return null;
	}
	const sources = parseStylesheetBundle(parameters.bundle);
	const rootDir = context.dependencies.parentPath;
	const entryFiles = sources.map(source => resolveBundleSource(context.filePath, source, rootDir));
	if (path.resolve(entryFiles[0]) !== path.resolve(context.filePath)) {
		throw new Error("CompactCSS bundle must be anchored by the requested stylesheet");
	}
	return {
		entryFiles,
		sources,
		variant: `bundle:${JSON.stringify(sources)}`
	};
}

/** Renders an ordered semantic fallback that delegates each source to ordinary single-entry CompactCSS. */
function renderCompactCssBundleFallback(sources) {
	return sources
		.map(source => `@import url(${JSON.stringify(createStylesheetChildUrl(source))});`)
		.join("\n");
}

/** Resolves one trusted public bundle member only after its authored path survives traversal inspection. */
function resolveBundleSource(fromFile, source, rootDir) {
	if (!source.startsWith("/") || hasStylesheetBundle(source)) {
		throw new Error(`CompactCSS bundle source must be a non-recursive public path: ${source}`);
	}
	assertSafeBundlePath(source);
	if (!cleanCssSource(source).toLowerCase().endsWith(".css")) {
		throw new Error(`CompactCSS bundle source is not CSS: ${source}`);
	}
	const resolved = resolveCssImport({ fromFile, source, rootDir });
	if (!resolved) {
		throw new Error(`CompactCSS bundle source escaped the public root: ${source}`);
	}
	return resolved;
}

/** Rejects traversal and malformed encodings before path normalization can erase hostile intent. */
function assertSafeBundlePath(source) {
	let inspected = cleanCssSource(source).replace(/\\/g, "/");
	for (let depth = 0; depth < 4; depth++) {
		let decoded;
		try {
			decoded = decodeURIComponent(inspected).replace(/\\/g, "/");
		} catch {
			throw new Error(`CompactCSS bundle source has malformed encoding: ${source}`);
		}
		if (decoded === inspected) {
			break;
		}
		inspected = decoded;
	}
	if (inspected.includes("\0") || inspected.split("/").some(segment => segment === "." || segment === "..")) {
		throw new Error(`CompactCSS bundle source contains forbidden traversal: ${source}`);
	}
}

module.exports = {
	assertSafeBundlePath,
	compactCssBundleOptions,
	renderCompactCssBundleFallback,
	resolveBundleSource
};
