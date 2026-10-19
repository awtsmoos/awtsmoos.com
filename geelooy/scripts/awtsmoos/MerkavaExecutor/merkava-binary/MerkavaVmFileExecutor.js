// B"H
/**
 * @file MerkavaVmFileExecutor.js
 * @description Chapter 43 — The gateway recognizes the entry's own speech.
 * The Awtsmoos renews the words, and unrelated scripts cannot steal its voice.
 */
const originalExecutor = require("./MerkavaVmFileExecutorLegacy.js");
const { executeVirtualCommonJs } = require("./MerkavaVirtualRequire.js");
const { entryModuleFormat, assertSupportedModuleFormat } = require("./MerkavaModuleFormat.js");

/** Prefer the executing entry's grammar to unrelated declarations elsewhere. */
function usesVirtualCommonJs(files = {}, entry = "/main.js") {
	return entryModuleFormat({ files, entry, runtime: "node" }, originalExecutor).format === "commonjs";
}

/** Keep supported module loaders bounded to supplied virtual files. */
async function executeVmFiles(options = {}) {
	const description = entryModuleFormat(options, originalExecutor);
	assertSupportedModuleFormat(description);
	if (description.format === "commonjs") {
		return executeVirtualCommonJs(options, originalExecutor);
	}
	return originalExecutor.executeVmFiles(options);
}

module.exports = { ...originalExecutor, executeVmFiles, usesVirtualCommonJs };
