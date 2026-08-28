//B"H
// Boruch Hashem
// Blessed is He

const path = require("path");
const { compileCompactModule } = require("./compiler.js");
const {
	captureDependencyManifest,
	createRecordingFs,
	isDependencyManifestFresh
} = require("./cacheManifest.js");

/**
 * @file cache.js
 * @description Caches CompactJS universes while exact dependency seals preserve freshness.
 * The Awtsmoos renews source before memory may call itself true;
 * Awtsmoos.com keeps one warm river, yet any changed dependency makes the light flow new.
 */
class CompactModuleCache {
	/**
	 * @description Creates empty source and in-flight maps for one process-local CompactJS cache.
	 * @returns {void}
	 */
	constructor() {
		this.entries = new Map();
		this.inflight = new Map();
	}

	/**
	 * @description Returns fresh cached source or performs one shared compilation for the canonical entry.
	 * @param {object} options CompactJS compiler options.
	 * @param {object} options.fs Promise-based filesystem authority.
	 * @param {string} options.entryFile Absolute JavaScript entry path.
	 * @param {string} options.rootDir Absolute public document root.
	 * @returns {Promise<string>} Cached or freshly compacted JavaScript source.
	 */
	async compile(options) {
		const key = cacheKey(options);
		if (this.inflight.has(key)) {
			return this.inflight.get(key);
		}
		const cached = this.entries.get(key);
		if (cached && await isDependencyManifestFresh(cached.manifest, options.fs)) {
			return cached.source;
		}
		return this.compileFresh(key, options);
	}

	/**
	 * @description Starts one compile promise and removes only that exact in-flight vessel when it settles.
	 * @param {string} key Canonical cache key.
	 * @param {object} options CompactJS compiler options.
	 * @returns {Promise<string>} Newly generated compact source.
	 */
	async compileFresh(key, options) {
		const promise = this.buildEntry(options);
		this.inflight.set(key, promise);
		try {
			return await promise;
		} finally {
			if (this.inflight.get(key) === promise) {
				this.inflight.delete(key);
			}
		}
	}

	/**
	 * @description Compiles through a recording filesystem and seals every observed dependency afterward.
	 * @param {object} options CompactJS compiler options.
	 * @returns {Promise<string>} Newly compacted source stored with a transitive dependency manifest.
	 */
	async buildEntry(options) {
		const dependencies = new Set();
		const recordingFs = createRecordingFs(options.fs, dependencies);
		const source = await compileCompactModule({
			entryFile: options.entryFile,
			fs: recordingFs,
			rootDir: options.rootDir
		});
		const manifest = await captureDependencyManifest(dependencies, options.fs);
		this.entries.set(cacheKey(options), { manifest, source });
		return source;
	}

	/**
	 * @description Clears all remembered compiled universes and shared in-flight bookkeeping.
	 * @returns {void}
	 */
	clear() {
		this.entries.clear();
		this.inflight.clear();
	}
}

/**
 * @description Builds a canonical cache key from resolved root and entry paths.
 * @param {object} options CompactJS compiler options.
 * @returns {string} Stable process-local cache key.
 */
function cacheKey(options) {
	return `${path.resolve(options.rootDir)}\u0000${path.resolve(options.entryFile)}`;
}

const compactModuleCache = new CompactModuleCache();

/**
 * @description Compiles through the shared CompactJS cache used by generated HTTP responses.
 * @param {object} options CompactJS compiler options.
 * @returns {Promise<string>} Cached or freshly compacted JavaScript source.
 */
async function compileCachedCompactModule(options) {
	return compactModuleCache.compile(options);
}

module.exports = { CompactModuleCache, compileCachedCompactModule, compactModuleCache };
