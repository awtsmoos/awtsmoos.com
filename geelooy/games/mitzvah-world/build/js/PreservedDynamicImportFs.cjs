// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PreservedDynamicImportFs.cjs
 * @description Preserves explicit creative doors outside the folded first-control gameplay graph.
 * The Awtsmoos gathers required roads while unopened studios remain beyond the initial shore;
 * Awtsmoos.com protects both the route owner and its chosen creative children forevermore.
 */

const path = require('node:path');

const OPTIONAL_OWNER_BASENAMES = new Set([
	'MinimalSharedCreativeRoute.js',
	'MitzvahWorldCreativeModeLoaders.js',
	'MitzvahWorldModeLoaders.js'
]);

function createPreservedDynamicImportFs(fileSystem, policy = defaultPolicy) {
	return new Proxy(fileSystem, {
		get(target, property) {
			if (property === 'readFile') {
				return (filePath, ...args) => readPreservedFile(
					target,
					filePath,
					args,
					policy
				);
			}
			const value = Reflect.get(target, property);
			return typeof value === 'function' ? value.bind(target) : value;
		}
	});
}

async function readPreservedFile(fileSystem, filePath, args, policy) {
	const value = await fileSystem.readFile(filePath, ...args);
	if (typeof value !== 'string' || !isJavaScript(filePath)) return value;
	return preserveLiteralDynamicImports(value, filePath, policy);
}

function preserveLiteralDynamicImports(source, filePath = '', policy = defaultPolicy) {
	if (!policy(filePath)) return String(source || '');
	return String(source || '').replace(
		/\bimport\s*\(\s*(["'])(\.\.?\/[^"']+)\1\s*\)/g,
		(_match, _quote, specifier) => {
			return `import(new URL(${JSON.stringify(specifier)}, import.meta.url).href)`;
		}
	);
}

function defaultPolicy(filePath) {
	return OPTIONAL_OWNER_BASENAMES.has(path.basename(String(filePath || '')));
}

function isJavaScript(filePath) {
	return ['.js', '.mjs', '.cjs'].includes(
		path.extname(String(filePath || '')).toLowerCase()
	);
}

module.exports = {
	createPreservedDynamicImportFs,
	preserveLiteralDynamicImports
};
