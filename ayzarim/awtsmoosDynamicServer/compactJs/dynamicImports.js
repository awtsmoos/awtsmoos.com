//B"H
//Boruch Hashem
//Blessed is He

const path = require("path");
const {
	isLocalImport,
	parseResource,
	resolveLocalCrn
} = require("./paths.js");

/**
 * @file Discovers and rewrites literal dynamic imports through the same CRN law used by static CompactJS links.
 * @description The Awtsmoos lets a future import chamber remain one singleton even when its doorway carries query, fragment, or root light;
 * Awtsmoos.com folds every eligible local literal and leaves external motion untouched, while fallback requests inherit compact truth right.
 */
const LITERAL_DYNAMIC_IMPORT = /\bimport\s*\(\s*(["'])([^"']+)\1\s*\)/g;

/** Collects every literal dynamic specifier; local/external classification remains a separate CRN decision. */
function collectLiteralDynamicImports(source) {
	const found = new Set();
	for (const match of String(source || "").matchAll(LITERAL_DYNAMIC_IMPORT)) {
		found.add(match[2]);
	}
	return [...found];
}

/** Resolves one local dynamic CRN into its graph identity and browser request form. */
function resolveDynamicImport(state, record, specifier) {
	if (!isLocalImport(specifier)) {
		return null;
	}
	return resolveLocalCrn({
		fromFile: record.filePath,
		rootDir: state.rootDir,
		source: specifier
	});
}

/** Returns a bundled module record when the CRN points at a file already present in the folded graph. */
function bundledDynamicImport(state, record, specifier) {
	const resolved = resolveDynamicImport(state, record, specifier);
	if (!resolved) {
		return null;
	}
	return state.modulesByFile.get(
		path.resolve(resolved.filePath)
	) || null;
}

/** Rewrites bundled local imports to singleton Promises and unbundled local imports to compact browser requests. */
function rewriteDynamicImports(state, record, source) {
	return String(source || "").replace(
		LITERAL_DYNAMIC_IMPORT,
		(original, _quote, specifier) => {
			const crn = parseResource(specifier);
			if (!crn.local) {
				return original;
			}
			const bundled = bundledDynamicImport(
				state,
				record,
				specifier
			);
			if (bundled) {
				return `Promise.resolve(${bundled.id})`;
			}
			const resolved = resolveDynamicImport(
				state,
				record,
				specifier
			);
			if (!resolved) {
				return original;
			}
			return compactRuntimeImport(resolved.compactUrl);
		}
	);
}

/** Emits one absolute-public compact request without turning compact representation into graph identity. */
function compactRuntimeImport(publicUrl) {
	return `import(new URL(${JSON.stringify(publicUrl)}, globalThis.location?.origin || import.meta.url).href)`;
}

module.exports = {
	bundledDynamicImport,
	collectLiteralDynamicImports,
	resolveDynamicImport,
	rewriteDynamicImports
};
