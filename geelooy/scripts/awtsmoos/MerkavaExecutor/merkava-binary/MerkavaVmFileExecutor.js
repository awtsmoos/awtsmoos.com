// B"H
/**
 * @file MerkavaVmFileExecutor.js
 * @description The Awtsmoos renews the entry's own language each moment.
 * Awtsmoos.com keeps unrelated modules from seizing its execution gate.
 * The vessel honors bounded ESM and virtual CommonJS without a host escape.
 */
const originalExecutor = require("./MerkavaVmFileExecutorLegacy.js");
const { executeVirtualCommonJs } = require("./MerkavaVirtualRequire.js");
const { entryModuleFormat, assertSupportedModuleFormat } = require("./MerkavaModuleFormat.js");

/** Choose the executing entry's grammar, never another file's grammar. */
function usesVirtualCommonJs(files = {}, entry = "/main.js") {
	return entryModuleFormat({ files, entry, runtime: "node" }, originalExecutor).format === "commonjs";
}

/** Execute the selected virtual module within the format-specific boundary. */
async function executeVmFiles(options = {}) {
	const description = entryModuleFormat(options, originalExecutor);
	assertSupportedModuleFormat(description);
	if (description.format === "commonjs") {
		return executeVirtualCommonJs(options, originalExecutor);
	}
	return originalExecutor.executeVmFiles(options);
}

module.exports = {
	...originalExecutor,
	executeVmFiles,
	usesVirtualCommonJs
};
