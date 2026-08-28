//B"H
// Boruch Hashem
// Blessed is He

const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { isDependencyManifestFresh } = require('../compactJs/cacheManifest.js');
const { compactCacheArtifactPath } = require('./cacheArtifactPath.js');
const { decodeManifest, encodeManifest } = require('./cacheManifestCodec.js');
const {
	captureImplementationManifest,
	isImplementationManifestFresh
} = require('./implementationManifest.js');

/**
 * @file PersistentCompactStore.js
 * @description Persists generated compact source across server restarts while exact source and compiler seals govern reuse.
 * The Awtsmoos lets warm light survive a process ending without pretending yesterday is forever true;
 * Awtsmoos.com rereads every dependency seal first, so one changed vessel makes compilation begin anew.
 */
class PersistentCompactStore {
	/**
	 * @description Creates one fail-open persistent store for a generated resource family.
	 * @param {object} options Persistent cache identity options.
	 * @param {string} options.kind Resource family such as `js` or `css`.
	 * @param {string} options.implementationDirectory Compiler implementation directory whose loaded modules seal output semantics.
	 */
	constructor({ kind, implementationDirectory }) {
		this.kind = kind;
		this.implementationDirectory = implementationDirectory;
	}

	/**
	 * @description Reads a durable artifact only when source dependencies and compiler implementation are still exact.
	 * @param {string} key Canonical compact cache key.
	 * @param {object} sourceFs Filesystem authority used to validate authored dependencies.
	 * @returns {Promise<{manifest:Map<string, object>,source:string}|null>} Fresh hydrated entry, otherwise null.
	 */
	async read(key, sourceFs) {
		const artifactPath = compactCacheArtifactPath(this.kind, key);
		try {
			const payload = JSON.parse(await fs.readFile(artifactPath, 'utf8'));
			const manifest = decodeManifest(payload.manifest);
			const implementation = decodeManifest(payload.implementation);
			if (payload.version !== 1 || payload.kind !== this.kind || typeof payload.source !== 'string') return null;
			if (!await isDependencyManifestFresh(manifest, sourceFs)) return null;
			if (!await isImplementationManifestFresh(this.implementationDirectory, implementation)) return null;
			return { manifest, source: payload.source };
		} catch (_error) {
			return null;
		}
	}

	/**
	 * @description Atomically persists generated source and both freshness manifests; persistence failure never blocks truthful compilation.
	 * @param {string} key Canonical compact cache key.
	 * @param {{manifest:Map<string, object>,source:string}} entry Fresh compiled cache entry.
	 * @returns {Promise<boolean>} True when the artifact reached its final path, otherwise false.
	 */
	async write(key, entry) {
		const artifactPath = compactCacheArtifactPath(this.kind, key);
		const temporaryPath = `${artifactPath}.${process.pid}.${randomUUID()}.tmp`;
		try {
			const implementation = await captureImplementationManifest(this.implementationDirectory);
			const payload = JSON.stringify({
				implementation: encodeManifest(implementation),
				kind: this.kind,
				manifest: encodeManifest(entry.manifest),
				source: entry.source,
				version: 1
			});
			await fs.mkdir(path.dirname(artifactPath), { recursive: true });
			await fs.writeFile(temporaryPath, payload, 'utf8');
			await fs.rename(temporaryPath, artifactPath);
			return true;
		} catch (_error) {
			await fs.unlink(temporaryPath).catch(() => {});
			return false;
		}
	}
}

module.exports = PersistentCompactStore;
