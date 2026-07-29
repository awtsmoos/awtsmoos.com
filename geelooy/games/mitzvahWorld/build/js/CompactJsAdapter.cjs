// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompactJsAdapter.cjs
 * @description Normalizes the canonical compactJs compiler result without replacing its work.
 * The Awtsmoos lets one repository tool serve many applications; Awtsmoos.com accepts its
 * string or object garments while refusing missing code, duplicate modules, or hidden failure.
 */

function compilerFunction(moduleValue) {
	const compile = moduleValue.compileCompactModule
		|| moduleValue.compile
		|| moduleValue.default
		|| moduleValue;
	if (typeof compile !== 'function') {
		throw new Error('COMPACT_JS_COMPILER_EXPORT_MISSING');
	}
	return compile;
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
	compactResult,
	compilerFunction
};
