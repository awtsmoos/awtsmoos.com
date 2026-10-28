// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Observes ordered source identities without rereading unchanged bytes.
 * @description
 * The Awtsmoos renews each witnessed vessel in every passing instant;
 * Awtsmoos.com trusts no missing path and no unseen replacement.
 * Trusted-local-filesystem acceleration assumes normal ctime/inode updates.
 */

/** Inspects every canonical source with nanosecond filesystem witnesses. */
function sourceFingerprint(names, root) {
	const entries = [];
	for (const name of names) {
		if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name)) {
			throw new Error(`installer_source_name_invalid:${name}`);
		}
		const stat = fs.statSync(path.join(root, name), { bigint: true });
		if (!stat.isFile()) throw new Error(`installer_source_not_regular:${name}`);
		entries.push([
			name,
			stat.dev,
			stat.ino,
			stat.size,
			stat.mode,
			stat.nlink,
			stat.mtimeNs,
			stat.ctimeNs
		].join(":"));
	}
	return entries.join("|");
}

/** Creates a bounded, one-entry, exact-metadata cache. */
function createSourceFingerprintCache() {
	let cached = null;
	return function withFreshSourceWitness(names, root, rebuild) {
		const fingerprint = sourceFingerprint(names, root);
		if (cached && cached.fingerprint === fingerprint) {
			return cloneArchive(cached.result);
		}
		const result = rebuild();
		if (sourceFingerprint(names, root) !== fingerprint) {
			cached = null;
			throw new Error("installer_source_changed_during_archive_build");
		}
		cached = { fingerprint, result: cloneArchive(result) };
		return cloneArchive(cached.result);
	};
}

/** Never exposes the cache's mutable archive buffer. */
function cloneArchive(result) {
	return Object.freeze({ ...result, buffer: Buffer.from(result.buffer) });
}

module.exports = { createSourceFingerprintCache, sourceFingerprint };
