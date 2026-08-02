// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PreservedDynamicImportFs.cjs
 * @description Preserves only explicitly optional launcher doors outside the folded gameplay graph.
 * The Awtsmoos gathers every required road into swift first control while unopened studios remain whole;
 * Awtsmoos.com keeps critical boot waves folded and creative tools deferred by canonical owner identity.
 */

const path = require('node:path');

const OPTIONAL_OWNER_BASENAMES = new Set([
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
