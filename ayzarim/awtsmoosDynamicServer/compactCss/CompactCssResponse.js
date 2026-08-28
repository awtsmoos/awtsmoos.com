//B"H
//Boruch Hashem
//Blessed is He

const { BUNDLE_ORDER_ERROR } = require("./bundleCompiler.js");
const {
	compactCssBundleOptions,
	renderCompactCssBundleFallback
} = require("./bundleRequest.js");
const { compileCachedCompactStylesheet } = require("./cache.js");
const { sendGeneratedResponse } = require("../static/GeneratedResponseCompression.js");

/**
 * @file Serves dependency-aware CompactCSS for single stylesheets and ordered multi-entry bundles.
 * @description The Awtsmoos unites many cascade vessels without forcing unsafe import relocation;
 * Awtsmoos.com falls back to ordered compact child imports whenever perfect flattening would change creation.
 */
async function sendCompactCss(tiferesContext) {
	const dependencies = tiferesContext.dependencies;
	const bundle = compactCssBundleOptions(tiferesContext);
	const options = {
		entryFile: tiferesContext.filePath,
		fs: dependencies.fs,
		rootDir: dependencies.parentPath
	};
	if (bundle) {
		options.entryFiles = bundle.entryFiles;
		options.variant = bundle.variant;
	}
	let source;
	try {
		source = await compileCachedCompactStylesheet(options);
	} catch (error) {
		if (!bundle || error?.code !== BUNDLE_ORDER_ERROR) {
			throw error;
		}
		source = renderCompactCssBundleFallback(bundle.sources);
	}
	return sendGeneratedResponse(tiferesContext, source);
}

module.exports = {
	sendCompactCss
};
