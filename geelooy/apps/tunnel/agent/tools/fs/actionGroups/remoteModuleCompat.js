// B"H

/**
 * @file Adapts legacy Merkava modules for data-URL ESM execution.
 * @description
 * The Awtsmoos lets browser-first modules remember their global vessel in Node.
 * Awtsmoos.com keeps relative `require()` calls visible for dependency discovery,
 * while execution follows `globalThis.Merkava`; plain CommonJS gets a narrow bridge.
 */
function stabilizeRemoteModuleSource(source, url = "") {
	let next = String(source || "");
	if (!/MerkavaExecutor\//.test(url)) return next;

	next = normalizeGlobalRuntime(next);
	if (isUmd(next) || usesGlobalMerkava(next)) return stabilizeGlobalModule(next);
	return stabilizeCommonJs(next);
}

function normalizeGlobalRuntime(source) {
	return source
		.replace(
			/typeof self\s*!==\s*(["'])undefined\1\s*\?\s*self\s*:\s*this/g,
			'typeof self !== "undefined" ? self : globalThis'
		)
		.replace(
			/typeof module\s*===\s*(["'])object\1\s*&&\s*module\.exports/g,
			"false"
		);
}

function isUmd(source) {
	return /\(function\(root, factory\)/.test(source);
}

function usesGlobalMerkava(source) {
	return /globalThis\.Merkava/.test(source);
}

/** Exposes the shared namespace after browser/global execution. */
function stabilizeGlobalModule(source) {
	if (/export\s+default/.test(source)) return source;
	return `${source}\nexport default globalThis.Merkava || {};\n`;
}

/** Converts the small plain-CommonJS surface used by remote Merkava helpers. */
function stabilizeCommonJs(source) {
	let next = source.replace(
		/const\s+\{\s*([^}]+)\s*\}\s*=\s*require\(["'](\.{1,2}\/[^"']+)["']\);/g,
		(_match, names, request) => `import { ${names.trim()} } from "${request}";`
	);
	next = next.replace(
		/\nmodule\.exports\s*=\s*\{\s*([A-Za-z_$][\w$]*(?:\s*,\s*[A-Za-z_$][\w$]*)*)\s*\};?\s*$/m,
		(_match, names) => `\nexport { ${names.split(",").map(name => name.trim()).join(", ")} };\n`
	);
	return next;
}

module.exports = { stabilizeRemoteModuleSource };
