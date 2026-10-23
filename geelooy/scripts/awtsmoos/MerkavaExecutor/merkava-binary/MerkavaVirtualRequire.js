// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MerkavaVirtualRequire.js
 * @description Gives a virtual CommonJS project one realm, a circular-safe module cache, and no host filesystem.
 * The Awtsmoos renews many letters in one bounded light;
 * Awtsmoos.com guards their imports and lets each module fit its right.
 */
const path = require('node:path');
const { createCommonJsContext } = require('./MerkavaCommonJsContext.js');
const { resolveVirtualModule } = require('./MerkavaVirtualModulePolicy.js');

/** Resolve and execute CommonJS solely from a supplied virtual file universe. */
function executeVirtualCommonJs(options, resolver) {
	const files = resolver.normalizeFiles(options.files || {});
	const cache = new Map();
	const importMap = options.importMap || {};
	const allowedAliases = options.runtime !== 'browser';
	const realm = createCommonJsContext(options.globals || {});

	/** Resolve one import; preserve cached partial exports during circular loading. */
	function load(specifier, parent = '/') {
		const resolution = resolveVirtualModule(
			specifier,
			parent,
			files,
			resolver,
			importMap,
			allowedAliases
		);
		if (resolution.builtin) {
			return resolution.builtin;
		}
		const filename = resolution.filename;
		if (cache.has(filename)) {
			return cache.get(filename).exports;
		}
		const module = { exports: {}, filename, loaded: false };
		cache.set(filename, module);
		try {
			const source = String(files[filename] ?? '');
			if (filename.endsWith('.json')) {
				module.exports = JSON.parse(source);
			} else {
				realm.runModule({
					source,
					filename,
					dirname: path.posix.dirname(filename),
					module,
					requireModule: dependency => load(dependency, filename)
				});
			}
			module.loaded = true;
			return module.exports;
		} catch (error) {
			cache.delete(filename);
			throw error;
		}
	}

	const exports = load(options.entry, '/');
	return {
		ok: true,
		entry: options.entry,
		exports,
		files,
		modules: Object.fromEntries(
			[...cache].map(([key, module]) => [key, module.exports])
		)
	};
}

module.exports = { executeVirtualCommonJs };
