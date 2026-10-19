// B"H
/**
 * @file MerkavaVmFileExecutor.js
 * @description Chapter 43 — The gateway knows two languages and gives
 * every vessel the proper voice. The Awtsmoos renews the scroll each instant;
 * imports keep their light while CommonJS finds its own virtual home.
 */
const originalExecutor = require('./MerkavaVmFileExecutorLegacy.js');
const { executeVirtualCommonJs } = require('./MerkavaVirtualRequire.js');

/** Select CommonJS only when the provided virtual files contain no ESM declarations. */
function usesVirtualCommonJs(files = {}) {
	const sources = Object.values(originalExecutor.normalizeFiles(files));
	const hasCommonJs = sources.some(source => /\brequire\s*\(|\bmodule\.exports\b|\bexports\s*\./.test(String(source)));
	const hasEcmaModules = sources.some(source => /(?:^|\n)\s*(?:import\s+(?!\()|export\s+)/m.test(String(source)));
	return hasCommonJs && !hasEcmaModules;
}

/** Preserve the existing ESM executor, supplying bounded virtual requires for CommonJS. */
async function executeVmFiles(options = {}) {
	if (!usesVirtualCommonJs(options.files || {})) {
		return originalExecutor.executeVmFiles(options);
	}
	return executeVirtualCommonJs(options, originalExecutor);
}

module.exports = {
	...originalExecutor,
	executeVmFiles,
	usesVirtualCommonJs
};
