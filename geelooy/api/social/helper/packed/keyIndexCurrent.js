//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module PackedKeyIndexCurrent
 * @description Index currency (tail catch-up / rebuild) and write noting for the packed key index (split from keyIndex.js, verbatim).
 */

	const fs = require('fs');
	const { blankIndex, cache, entryFor, noteRecord } = require('./keyIndexStore.js');
	const { persist } = require('./keyIndexPersist.js');
	const { keyOfHead, scanRange } = require('./keyIndexScan.js');

/**
 * Ensures the index covers the whole file: tail-scans appended bytes, or
 * rebuilds fully when the file shrank, was replaced, or was rewritten
 * in place (same size, different identity).
 */
async function ensureCurrent(file) {
	const entry = entryFor(file);
	let st = null;
	try { st = fs.statSync(file); } catch { return entry; }
	const fp = { dev: st.dev, ino: st.ino, size: st.size, mtimeMs: st.mtimeMs };
	const size = st.size;
	const prev = entry.index.fp;
	let rebuild = false;
	if (prev) {
		// Positive evidence the file was replaced or rewritten in place.
		if (prev.dev !== fp.dev || prev.ino !== fp.ino) rebuild = true;
		else if (size < prev.size) rebuild = true;
		else if (size === prev.size && prev.mtimeMs !== fp.mtimeMs) rebuild = true;
	}
	// No previous fingerprint (fresh sidecar load): trust the sidecar's
	// recorded size and tail-scan forward — never rescan from zero.
	if (rebuild) {
		entry.index = blankIndex();
		cache.set(file, entry);
	}
	if (size > entry.index.size) {
		const from = entry.index.size;
		await scanRange(file, from, size, (offset, head) => {
			noteRecord(entry, offset, keyOfHead(head));
		});
		entry.index.size = size;
		entry.index.fp = fp;
		entry.forcePersist = true;
		persist(file, entry);
	} else if (!entry.index.fp) {
		entry.index.fp = fp;
	}
	return entry;
}

/**
 * Notes a single appended record (called synchronously by the write path).
 * @param {string} file Shard file path.
 * @param {number} offset Byte offset where the record's line starts.
 * @param {string} key Envelope key.
 */
function noteWrite(file, offset, key) {
	try {
		const entry = entryFor(file);
		noteRecord(entry, offset, key);
		let st = null;
		try { st = fs.statSync(file); } catch { /* ignore */ }
		if (st) {
			if (st.size > entry.index.size) entry.index.size = st.size;
			entry.index.fp = { dev: st.dev, ino: st.ino, size: st.size, mtimeMs: st.mtimeMs };
		}
		persist(file, entry);
	} catch { /* indexing must never break writes */ }
}

module.exports = {
	ensureCurrent,
	noteWrite
};
