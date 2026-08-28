//B"H
//Boruch Hashem
//Blessed is He

const { compileCompactStylesheet } = require("./compiler.js");
const { compileCompactStylesheetBundle } = require("./bundleCompiler.js");
const compactStylesheetCacheKey = require("./cacheKey.js");
const { isDependencyManifestFresh } = require("../compactJs/cacheManifest.js");
const { buildStableCompactArtifact } = require("../compactJs/cacheBuildConsistency.js");
const PersistentCompactStore = require("../compactCache/PersistentCompactStore.js");

/**
 * @file Caches folded CompactCSS only when every imported stylesheet stays stable for the whole build.
 * @description The Awtsmoos renews each single or bundled cascade before memory may call it true;
 * Awtsmoos.com retries a shifting import river so persistence never embalms yesterday's hue.
 */
class CompactStylesheetCache {
	/** Creates deterministic memory state with optional durable backing reserved for production singleton use. */
	constructor({ persistentStore = null } = {}) {
		this.entries = new Map();
		this.inflight = new Map();
		this.persistentStore = persistentStore;
	}

	/** Shares one promise across validation, disk rehydration, and a stable fresh compilation. */
	async compile(options) {
		const key = compactStylesheetCacheKey(options);
		if (this.inflight.has(key)) {
			return this.inflight.get(key);
		}
		const promise = this.resolveEntry(key, options);
		this.inflight.set(key, promise);
		try {
			return await promise;
		} finally {
			if (this.inflight.get(key) === promise) {
				this.inflight.delete(key);
			}
		}
	}

	/** Resolves fresh memory, fresh persistence, then a verified stable stylesheet build. */
	async resolveEntry(key, options) {
		const memory = this.entries.get(key);
		if (memory && await isDependencyManifestFresh(memory.manifest, options.fs)) {
			return memory.source;
		}
		const durable = await this.readPersistent(key, options);
		if (durable) {
			return durable.source;
		}
		return this.buildEntry(key, options);
	}

	/** Rehydrates one durable stylesheet after its complete dependency manifest remains exact. */
	async readPersistent(key, options) {
		if (!this.persistentStore) {
			return null;
		}
		const entry = await this.persistentStore.read(key, options.fs);
		if (entry) {
			this.entries.set(key, entry);
		}
		return entry;
	}

	/** Folds repeatedly when necessary and commits only a stylesheet stable across its own build interval. */
	async buildEntry(key, options) {
		const entry = await buildStableCompactArtifact({
			fs: options.fs,
			label: "CompactCSS",
			compile: recordingFs => compileStylesheet({ ...options, fs: recordingFs })
		});
		this.entries.set(key, entry);
		if (this.persistentStore) {
			await this.persistentStore.write(key, entry);
		}
		return entry.source;
	}

	/** Clears process-local CSS cache state for tests and lifecycle reset. */
	clear() {
		this.entries.clear();
		this.inflight.clear();
	}
}

/** Selects multi-entry compilation only when an ordered bundle was explicitly requested. */
function compileStylesheet(options) {
	return Array.isArray(options.entryFiles) && options.entryFiles.length > 1
		? compileCompactStylesheetBundle(options)
		: compileCompactStylesheet(options);
}

const compactStylesheetCache = new CompactStylesheetCache({
	persistentStore: new PersistentCompactStore({ kind: "css", implementationDirectory: __dirname })
});

function compileCachedCompactStylesheet(options) {
	return compactStylesheetCache.compile(options);
}

module.exports = {
	CompactStylesheetCache,
	compactStylesheetCache,
	compileCachedCompactStylesheet
};
