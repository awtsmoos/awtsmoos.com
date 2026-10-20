//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module PackedKeyIndexStore
 * @description State owner for the packed key index: sidecar constants, the cache Map, index entry lifecycle and record noting (split from keyIndex.js, verbatim).
 */

	const fs = require('fs');
	const path = require('path');

const SIDECAR_SUFFIX = '.keyidx.json';
const INDEX_VERSION = 1;
// Persist the sidecar at most this often per file; every write still updates
// the in-memory index synchronously, so throttling only delays crash-safety.
const PERSIST_MIN_INTERVAL_MS = 30 * 1000;
const MAX_PERSIST_BYTES = 64 * 1024 * 1024;

const cache = new Map(); // file -> { id, index, lastPersistMs, forcePersist }

/** Stable file identity: only a replacement (new inode) refreshes the cache entry. Size/mtime currency is handled by ensureCurrent. */
function fileIdentity(file) {
	try {
		const st = fs.statSync(file);
		return `${st.dev}:${st.ino}`;
	} catch {
		return '';
	}
}

function sidecarFile(file) {
	return file + SIDECAR_SUFFIX;
}

function blankIndex() {
	return { v: INDEX_VERSION, size: 0, fp: null, keys: Object.create(null), sfx: Object.create(null) };
}

function lastSegment(key) {
	const i = String(key).lastIndexOf('/');
	return i < 0 ? String(key) : String(key).slice(i + 1);
}

/** Loads the sidecar from disk, tolerating absence and corruption. */
function loadSidecar(file) {
	const index = blankIndex();
	try {
		const raw = fs.readFileSync(sidecarFile(file), 'utf8');
		if (raw.length > MAX_PERSIST_BYTES) return index;
		const parsed = JSON.parse(raw);
		if (!parsed || parsed.v !== INDEX_VERSION) return index;
		if (parsed.keys && typeof parsed.keys === 'object') {
			for (const [k, off] of Object.entries(parsed.keys)) {
				if (typeof off === 'number' && off >= 0) index.keys[k] = off;
			}
		}
		if (parsed.sfx && typeof parsed.sfx === 'object') {
			for (const [seg, list] of Object.entries(parsed.sfx)) {
				if (Array.isArray(list)) index.sfx[seg] = list.filter(k => typeof k === 'string');
			}
		}
		if (typeof parsed.size === 'number' && parsed.size >= 0) index.size = parsed.size;
		if (parsed.fp && typeof parsed.fp === 'object') index.fp = parsed.fp;
	} catch {
		// Absent or corrupt sidecar: start blank; the tail scan rebuilds.
	}
	return index;
}

/** Returns the cached index entry for a shard file, refreshing when stale. */
function entryFor(file) {
	const id = fileIdentity(file);
	let entry = cache.get(file);
	if (!entry || entry.id !== id) {
		entry = { id, index: loadSidecar(file), lastPersistMs: 0, forcePersist: false };
		cache.set(file, entry);
	}
	return entry;
}

/** Records one observed (offset, key) pair into the index. */
function noteRecord(entry, offset, key) {
	if (!key) return;
	entry.index.keys[key] = offset;
	const seg = lastSegment(key);
	const list = entry.index.sfx[seg] || (entry.index.sfx[seg] = []);
	if (!list.includes(key)) list.push(key);
}

/** Drops cached index state (tests / graceful shutdown). */
function clearCache() {
	cache.clear();
}

module.exports = {
	SIDECAR_SUFFIX,
	INDEX_VERSION,
	PERSIST_MIN_INTERVAL_MS,
	blankIndex,
	cache,
	clearCache,
	entryFor,
	lastSegment,
	loadSidecar,
	noteRecord,
	sidecarFile
};
