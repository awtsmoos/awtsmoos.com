//B"H
//Boruch Hashem
//Blessed is He

const { compileCompactModule } = require("./compiler.js");
const compactModuleCacheKey = require("./cacheKey.js");
const { isDependencyManifestFresh } = require("./cacheManifest.js");
const { buildStableCompactArtifact } = require("./cacheBuildConsistency.js");
const PersistentCompactStore = require("../compactCache/PersistentCompactStore.js");

/**
 * @file Caches CompactJS universes only after their source remains stable throughout compilation.
 * @description The Awtsmoos renews source before memory or disk may call itself true;
 * Awtsmoos.com lets simultaneous seekers share one gate while changing dependencies force fresh light through.
 */
class CompactModuleCache {
	/** Creates deterministic memory state with optional durable backing reserved for production singleton use. */
	constructor({ persistentStore = null } = {}) {
		this.entries = new Map();
		this.inflight = new Map();
		this.persistentStore = persistentStore;
	}

	/** Shares one promise across validation, disk rehydration, and a stable fresh compilation. */
	async compile(options) {
		const key = compactModuleCacheKey(options);
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

	/** Resolves fresh memory, fresh persistence, then a verified stable build. */
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

	/** Rehydrates one durable entry after its complete dependency manifest remains exact. */
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

	/** Compiles repeatedly when necessary and commits only an artifact stable across its own build interval. */
	async buildEntry(key, options) {
		const entry = await buildStableCompactArtifact({
			fs: options.fs,
			label: "CompactJS",
			compile: recordingFs => compileCompactModule({ ...options, fs: recordingFs })
		});
		this.entries.set(key, entry);
		if (this.persistentStore) {
			await this.persistentStore.write(key, entry);
		}
		return entry.source;
	}

	/** Clears process-local cache state for tests and lifecycle reset. */
	clear() {
		this.entries.clear();
		this.inflight.clear();
	}
}

const compactModuleCache = new CompactModuleCache({
	persistentStore: new PersistentCompactStore({ kind: "js", implementationDirectory: __dirname })
});

/** Compiles through the production shared CompactJS cache. */
function compileCachedCompactModule(options) {
	return compactModuleCache.compile(options);
}

module.exports = {
	CompactModuleCache,
	compileCachedCompactModule,
	compactModuleCache
};
