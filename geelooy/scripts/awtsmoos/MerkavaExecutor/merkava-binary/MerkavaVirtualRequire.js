// B"H
/**
 * @file MerkavaVirtualRequire.js
 * @description Chapter 42 — A door opens only onto the worlds entrusted to it.
 * The Awtsmoos grants each virtual vessel its own neighbors, never the keys
 * to the host machine. Paths exist here as letters within a bounded scroll.
 */
const path = require('node:path');
const vm = require('node:vm');

/** Resolve and run CommonJS files from the supplied virtual file map only. */
function executeVirtualCommonJs(options, resolver) {
	const files = resolver.normalizeFiles(options.files || {});
	const cache = new Map();
	const suppliedGlobals = options.globals || {};
	const importMap = options.importMap || {};
	const allowedAliases = options.runtime !== 'browser';

	/** Find exactly one dependency within the same supplied virtual universe. */
	function load(specifier, parent = '/') {
		if (specifier === 'path' || specifier === 'node:path') {
			return path.posix;
		}
		const resolved = resolver.resolveSpecifier(specifier, parent, importMap, allowedAliases);
		const filename = resolver.findExistingKey(files, resolved);
		if (!filename) {
			const error = new Error(`Virtual module not found: ${specifier} from ${parent}`);
			error.code = 'MODULE_NOT_FOUND';
			throw error;
		}
		if (cache.has(filename)) {
			return cache.get(filename).exports;
		}
		const module = { exports: {}, filename, loaded: false };
		cache.set(filename, module);
		const dirname = path.posix.dirname(filename);
		const localRequire = dependency => load(dependency, filename);
		try {
			const source = String(files[filename] ?? '');
			if (filename.endsWith('.json')) {
				module.exports = JSON.parse(source);
			} else {
				const context = vm.createContext({
					...suppliedGlobals,
					module,
					exports: module.exports,
					require: localRequire,
					__filename: filename,
					__dirname: dirname
				});
				const script = new vm.Script(source, { filename });
				script.runInContext(context, { timeout: 5000 });
			}
			module.loaded = true;
			return module.exports;
		} catch (error) {
			cache.delete(filename);
			throw error;
		}
	}

	const result = load(options.entry, '/');
	return {
		ok: true,
		entry: options.entry,
		exports: result,
		files,
		modules: Object.fromEntries([...cache].map(([key, module]) => [key, module.exports]))
	};
}

module.exports = { executeVirtualCommonJs };
