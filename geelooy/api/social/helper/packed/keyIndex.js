//B"H
/**
 * @module PackedKeyIndex
 * @description
 * B"H 2026-10-12 (api-hardening): single-key reads on the JSONL packed
 * engine reverse-scanned the whole shard file, so a MISSING key on a
 * multi-GB shard hung past nginx's timeout (504) instead of answering 404.
 * This vessel keeps a lightweight key -> byte-offset sidecar per shard file:
 *
 *   <shardFile>.keyidx.json = { v:1, size:<bytes>, keys:{<key>:<offset>}, sfx:{<lastSegment>:[<key>]} }
 *
 * Correctness invariants (reads stay exact, never approximate):
 *   - The sidecar only ever records offsets of records actually appended;
 *     sidecar.size <= file size always holds, so a stale sidecar is healed
 *     by scanning just the TAIL (from sidecar.size to EOF), never the file.
 *   - Latest-wins is preserved: every write updates the key's offset to the
 *     newest record; the reader parses exactly that one line and honors
 *     tombstones (op:'del' reads as not-found).
 *   - A shrunk/replaced file (size < sidecar.size) triggers a full rebuild.
 *   - Bulk appends that bypass the single-write path need no special
 *     handling: the next read's tail catch-up indexes them.
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

/**
 * Scans one byte range of the file, calling onRecord(offset, head) per line.
 * Used for tail catch-up: only bytes appended after the sidecar's size.
 */
async function scanRange(file, from, to, onRecord) {
	if (to <= from) return;
	const CHUNK = 4 * 1024 * 1024;
	const HEAD = 512;
	let fh = null;
	try {
		fh = await fs.promises.open(file, 'r');
		let pos = from;
		let pending = Buffer.alloc(0);
		const buf = Buffer.allocUnsafe(CHUNK);
		while (pos < to) {
			const n = Math.min(CHUNK, to - pos);
			const { bytesRead } = await fh.read(buf, 0, n, pos);
			if (bytesRead <= 0) break;
			const combined = pending.length
				? Buffer.concat([pending, buf.subarray(0, bytesRead)])
				: buf.subarray(0, bytesRead);
			let lineStart = pos - pending.length;
			let cur = 0;
			for (;;) {
				const nl = combined.indexOf(0x0A, cur);
				if (nl < 0) break;
				const head = combined.subarray(cur, Math.min(nl, cur + HEAD)).toString('utf8');
				const keep = onRecord(lineStart, head);
				if (keep === false) { await fh.close(); return; }
				cur = nl + 1;
				lineStart = pos - pending.length + cur;
			}
			pending = combined.subarray(cur);
			pos += bytesRead;
			await new Promise(r => setImmediate(r));
		}
		if (pending.length) {
			onRecord(to - pending.length, pending.subarray(0, HEAD).toString('utf8'));
		}
	} finally {
		try { await fh?.close(); } catch { /* ignore */ }
	}
}

/** Extracts the envelope key from a line head without full JSON.parse. */
function keyOfHead(head) {
	const m = /"key"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(head);
	if (!m) return null;
	try {
		return JSON.parse(`"${m[1]}"`);
	} catch {
		return m[1];
	}
}

/** Records one observed (offset, key) pair into the index. */
function noteRecord(entry, offset, key) {
	if (!key) return;
	entry.index.keys[key] = offset;
	const seg = lastSegment(key);
	const list = entry.index.sfx[seg] || (entry.index.sfx[seg] = []);
	if (!list.includes(key)) list.push(key);
}

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

/** Drops cached index state (tests / graceful shutdown). */
function clearCache() {
	cache.clear();
}

module.exports = {
	SIDECAR_SUFFIX,
	clearCache,
	ensureCurrent,
	findIndexed,
	findIndexedBySuffix,
	listIndexed,
	noteWrite
};
