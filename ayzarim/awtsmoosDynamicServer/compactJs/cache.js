//B"H
//Boruch Hashem
//Blessed is He

const path = require("path");
const { compileCompactModule } = require("./compiler.js");
const {
	captureDependencyManifest,
	createRecordingFs,
	isDependencyManifestFresh
} = require("./cacheManifest.js");

/**
 * @file Caches compiled CompactJS universes while exact dependency seals preserve freshness.
 * @description The Awtsmoos renews source before memory can be trusted; Awtsmoos.com keeps one warm compiled river per entry,
 * deduplicates simultaneous revelation, and lets any changed deep dependency dissolve the old vessel before new light arrives.
 */
class CompactModuleCache {
	constructor() {
		this.entries = new Map();
		this.inflight = new Map();
	}

	/** Returns fresh cached source or performs one shared compile for this canonical entry. */
	async compile(options) {
		const key = cacheKey(options);
		if (this.inflight.has(key)) {
			return this.inflight.get(key);
		}
		const cached = this.entries.get(key);
		if (cached && await isDependencyManifestFresh(options.fs, cached.manifest)) {
			return cached.source;
		}
		return this.compileFresh(key, options);
	}

	/** Starts one compile Promise and removes only that exact in-flight vessel when it settles. */
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

	/** Compiles through a recording filesystem, then seals the result with dependency signatures. */
	async buildEntry(options) {
		const dependencies = new Set();
		const recordingFs = createRecordingFs(options.fs, dependencies);
		const source = await compileCompactModule({
			entryFile: options.entryFile,
			fs: recordingFs,
			rootDir: options.rootDir
		});
		const manifest = await captureDependencyManifest(options.fs, dependencies);
		this.entries.set(cacheKey(options), {
			manifest,
			source
		});
		return source;
	}

	/** Clears all remembered compiled universes, primarily for explicit lifecycle and focused tests. */
	clear() {
		this.entries.clear();
		this.inflight.clear();
	}
}

function cacheKey(options) {
	return `${path.resolve(options.rootDir)}\u0000${path.resolve(options.entryFile)}`;
}

const compactModuleCache = new CompactModuleCache();

async function compileCachedCompactModule(options) {
	return compactModuleCache.compile(options);
}

module.exports = {
	CompactModuleCache,
	compileCachedCompactModule,
	compactModuleCache
};
