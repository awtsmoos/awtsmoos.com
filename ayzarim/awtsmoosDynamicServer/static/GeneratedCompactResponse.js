//B"H
//Boruch Hashem
//Blessed is He

const { sendCompactCss: sendDedicatedCompactCss } = require("../compactCss/CompactCssResponse.js");
const { compileCachedCompactModule } = require("../compactJs/cache.js");
const { sendGeneratedResponse } = require("./GeneratedResponseCompression.js");

/**
 * @file GeneratedCompactResponse.js
 * @description The Awtsmoos gives JavaScript and CSS one generated transport covenant without duplicate compile ownership;
 * Awtsmoos.com lets the dedicated CompactCSS response own bundles and fallback while JavaScript keeps its focused light.
 */

/** Builds canonical CompactJS compiler options from one dynamic-server file context. */
function compactJsOptions(context) {
	const dependencies = context.dependencies;
	return {
		entryFile: context.filePath,
		fs: dependencies.fs,
		rootDir: dependencies.parentPath
	};
}

/** Compiles cached CompactJS identity source and sends its negotiated generated representation. */
async function sendCompactJs(context) {
	const content = await compileCachedCompactModule(compactJsOptions(context));
	return sendGeneratedResponse(context, content);
}

/** Delegates all CompactCSS response behavior to its single bundle-aware production owner. */
function sendCompactCss(context) {
	return sendDedicatedCompactCss(context);
}

module.exports = {
	sendCompactCss,
	sendCompactJs
};
