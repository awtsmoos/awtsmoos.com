// B"H
/**
 * @file MerkavaVmFileExecutor.js
 * @description Route a virtual CommonJS entrypoint through a bounded module
 * loader; unrelated ESM files must not change the entrypoint's semantics.
 */
const originalExecutor = require("./MerkavaVmFileExecutorLegacy.js");
const { executeVirtualCommonJs } = require("./MerkavaVirtualRequire.js");

/** Recognize CommonJS declarations in a supplied virtual file. */
function containsCommonJs(source) {
	return /\brequire\s*\(|\bmodule\.exports\b|\bexports\s*\./.test(String(source));
}

/** Recognize static ECMAScript module declarations in a virtual file. */
function containsEcmaModules(source) {
	return /(?:^|\n)\s*(?:import\s+(?!\()|export\s+)/m.test(String(source));
}

/**
 * Choose the loader from the requested entrypoint whenever its syntax is
 * identifiable. An unrelated file cannot force a CommonJS entry into ESM.
 * Retain prior collection-wide behavior for syntax-neutral entrypoints.
 * @param {object} files Virtual filenames mapped to source text.
 * @param {string} entry Requested entrypoint.
 * @returns {boolean} Whether the bounded CommonJS loader is appropriate.
 */
function usesVirtualCommonJs(files = {}, entry = "") {
	const normalized = originalExecutor.normalizeFiles(files);
	const entryKey = entry && originalExecutor.findExistingKey(normalized, entry);
	if (entryKey) {
		const entrySource = normalized[entryKey];
		const commonJs = containsCommonJs(entrySource);
		const ecmaModule = containsEcmaModules(entrySource);
		if (commonJs || ecmaModule) return commonJs && !ecmaModule;
	}
	const sources = Object.values(normalized);
	return sources.some(containsCommonJs) && !sources.some(containsEcmaModules);
}

/** Execute the selected virtual module without exposing host Node require. */
async function executeVmFiles(options = {}) {
	if (!usesVirtualCommonJs(options.files || {}, options.entry || "")) {
		return originalExecutor.executeVmFiles(options);
	}
	return executeVirtualCommonJs(options, originalExecutor);
}

module.exports = {
	...originalExecutor,
	executeVmFiles,
	usesVirtualCommonJs
};
