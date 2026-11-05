// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompactJsAdapter.cjs
 * @description Normalizes CompactJS results and honors preserved browser dynamic-import boundaries.
 * The Awtsmoos gathers required chambers without swallowing unopened worlds;
 * Awtsmoos.com keeps static folding, complete optional code, deterministic inputs, and result truth explicit.
 */

const {
	createPreservedDynamicImportFs
} = require('./PreservedDynamicImportFs.cjs');

function compilerFunction(moduleValue) {
	const compile = moduleValue.compileCompactModule
		|| moduleValue.compile
		|| moduleValue.default
		|| moduleValue;
	if (typeof compile !== 'function') {
		throw new Error('COMPACT_JS_COMPILER_EXPORT_MISSING');
	}
	return options => compile(adaptCompilerOptions(options));
}

function adaptCompilerOptions(options = {}) {
	if (!options.preserveDynamicImports) return options;
	return {
		...options,
		fs: createPreservedDynamicImportFs(options.fs)
	};
}

function compactResult(value) {
	if (typeof value === 'string') {
		return { code: value, map: null, modules: [] };
	}
	const code = value?.code
		|| value?.output
		|| value?.bundle
		|| value?.content;
	if (typeof code !== 'string' || !code.trim()) {
		throw new Error('COMPACT_JS_CODE_MISSING');
	}
	const modules = Array.isArray(value.modules)
		? value.modules.map(moduleValue => {
			return typeof moduleValue === 'string'
				? moduleValue
				: moduleValue.id || moduleValue.path || JSON.stringify(moduleValue);
		})
		: [];
	if (new Set(modules).size !== modules.length) {
		throw new Error('COMPACT_JS_DUPLICATE_MODULES');
	}
	return {
		code,
		map: value.map || value.sourceMap || null,
		modules
	};
}

module.exports = {
	adaptCompilerOptions,
	compactResult,
	compilerFunction
};
