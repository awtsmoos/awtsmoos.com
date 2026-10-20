//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module PackedKeyIndexRead
 * @description Indexed reads (exact, suffix, prefix list) for the packed key index (split from keyIndex.js, verbatim).
 */

	const fs = require('fs');
	const { lastSegment } = require('./keyIndexStore.js');
	const { ensureCurrent } = require('./keyIndexCurrent.js');

/** Reads and parses the single line starting at offset. */
async function readLineAt(file, offset) {
	let fh = null;
	try {
		fh = await fs.promises.open(file, 'r');
		const st = await fh.stat();
		const n = Math.min(4 * 1024 * 1024, st.size - offset);
		if (n <= 0) return null;
		const buf = Buffer.allocUnsafe(n);
		const { bytesRead } = await fh.read(buf, 0, n, offset);
		const text = buf.subarray(0, bytesRead).toString('utf8');
		const nl = text.indexOf('\n');
		const line = nl < 0 ? text : text.slice(0, nl);
		if (!line.trim()) return null;
		return JSON.parse(line);
	} catch {
		return null;
	} finally {
		try { await fh?.close(); } catch { /* ignore */ }
	}
}

/**
 * Exact-key read through the index: O(tail-bytes) worst case, O(1) steady.
 * @returns {Promise<object|null>} Latest non-tombstoned record or null.
 */
async function findIndexed(file, key) {
	if (!file || !fs.existsSync(file)) return null;
	const entry = await ensureCurrent(file);
	const offset = entry.index.keys[key];
	if (offset === undefined) return null; // definitive miss: no full scan
	const rec = await readLineAt(file, offset);
	if (!rec || rec.key !== key) {
		// Index/file skew (should not happen): drop the entry and fail
		// closed — the next ensureCurrent re-derives it from the tail.
		delete entry.index.keys[key];
		return null;
	}
	return rec.op === 'del' ? null : rec;
}

/**
 * Bare-postId (final-segment) read through the index.
 * @returns {Promise<object|null>} Latest non-tombstoned record or null.
 */
async function findIndexedBySuffix(file, postId) {
	if (!file || !fs.existsSync(file) || !postId || postId.includes('/')) return null;
	const entry = await ensureCurrent(file);
	const keys = entry.index.sfx[lastSegment(postId)] || [];
	let found = null;
	// Newest-first: the sfx list is oldest-first, so scan from the end —
	// a tombstoned newest key falls through to older same-suffix keys.
	for (let i = keys.length - 1; i >= 0; i--) {
		const key = keys[i];
		if (!key.endsWith('/' + postId)) continue;
		const rec = await readLineAt(file, entry.index.keys[key]);
		if (rec && rec.key === key && rec.op !== 'del') { found = rec; break; }
	}
	return found;
}

/**
 * Prefix key listing through the index: newest-first, latest-wins exact.
 * @returns {Promise<string[]|null>} Keys or null when the file is absent.
 */
async function listIndexed(file, prefix = '', limit = 200) {
	if (!file || !fs.existsSync(file)) return null;
	const entry = await ensureCurrent(file);
	const keys = Object.keys(entry.index.keys).reverse();
	const out = [];
	const seen = new Set();
	for (const key of keys) {
		if (seen.has(key)) continue;
		seen.add(key);
		if (prefix && !key.startsWith(prefix)) continue;
		const rec = await readLineAt(file, entry.index.keys[key]);
		if (!rec || rec.key !== key || rec.op === 'del') continue;
		out.push(key);
		if (out.length >= limit) break;
	}
	return out;
}

module.exports = {
	findIndexed,
	findIndexedBySuffix,
	listIndexed,
	readLineAt
};
