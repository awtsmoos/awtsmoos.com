//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module PackedKeyIndexPersist
 * @description Sidecar persistence for the packed key index (split from keyIndex.js, verbatim).
 */

	const fs = require('fs');
	const path = require('path');
	const { blankIndex, sidecarFile, INDEX_VERSION, PERSIST_MIN_INTERVAL_MS } = require('./keyIndexStore.js');

/** Persists the sidecar (read-modify-write merge so concurrent writers heal). */
function persist(file, entry) {
	const now = Date.now();
	if (now - entry.lastPersistMs < PERSIST_MIN_INTERVAL_MS && !entry.forcePersist) return;
	entry.lastPersistMs = now;
	entry.forcePersist = false;
	let disk = blankIndex();
	try {
		const raw = fs.readFileSync(sidecarFile(file), 'utf8');
		const parsed = JSON.parse(raw);
		if (parsed && parsed.v === INDEX_VERSION) disk = parsed;
	} catch { /* absent/corrupt: overwrite */ }
	// Merge: our in-memory offsets are authoritative for keys we wrote, but
	// never move size backwards (a concurrent writer may be ahead of us).
	const merged = {
		v: INDEX_VERSION,
		size: Math.max(Number(disk.size) || 0, entry.index.size),
		fp: entry.index.fp || disk.fp || null,
		keys: { ...(disk.keys || {}), ...entry.index.keys },
		sfx: { ...(disk.sfx || {}) }
	};
	for (const [seg, list] of Object.entries(entry.index.sfx)) {
		const have = new Set(merged.sfx[seg] || []);
		for (const k of list) have.add(k);
		merged.sfx[seg] = [...have];
	}
	try {
		fs.mkdirSync(path.dirname(sidecarFile(file)), { recursive: true });
		fs.writeFileSync(sidecarFile(file), JSON.stringify(merged));
	} catch { /* best-effort: reads still work via tail scan */ }
}

module.exports = {
	persist
};
