// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedConnectionsIndex
 * @description
 * Loads the reverse/forward citation indexes that power the reader "Connections"
 * section. Index files live in ./citationIndexes and follow the citation-audit
 * format:
 *   forward_<name>.json: { BH, files, postsWithCitations, forward: { postId: [{key, para, raw, kind}] } }
 *   reverse_<name>.json: { BH, uniqueKeys, index: { citationKey: [{post, para, raw}] } }
 *
 * New index pairs are consumed automatically as they land in the directory —
 * the in-memory cache is keyed on a file mtime/size signature, so a dropped-in
 * reverse_*.json / forward_*.json is picked up on the next request without a
 * restart. Partially-written or unparseable files are skipped (and retried on
 * the next signature change) instead of failing the whole load.
 */

const fs = require('fs');
const path = require('path');

const INDEX_DIR = path.join(__dirname, 'citationIndexes');
const INDEX_FILE_RE = /^(forward|reverse)_.+\.json$/;

let cached = null; // { dir, sig, data }

/** @description Builds a cheap change signature for the index directory. @param {string} dir Index directory. @returns {string|null} Signature or null when unreadable. */
function dirSignature(dir) {
	try {
		const names = fs.readdirSync(dir).filter((n) => INDEX_FILE_RE.test(n)).sort();
		const parts = [];
		for (const name of names) {
			try {
				const st = fs.statSync(path.join(dir, name));
				parts.push(name + ':' + st.mtimeMs + ':' + st.size);
			} catch (_) {
				parts.push(name + ':missing');
			}
		}
		return parts.join('|');
	} catch (_) {
		return null;
	}
}

/** @description Reads and parses one JSON file. @param {string} filePath Absolute path. @returns {*} Parsed document. */
function readJsonFile(filePath) {
	return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/** @description Normalizes one forward citation entry. @param {*} entry Raw entry. @returns {Object|null} Normalized {key, raw, para, kind} or null. */
function normalizeForwardEntry(entry) {
	if (!entry || typeof entry !== 'object') return null;
	const key = String(entry.key || '').trim();
	if (!key) return null;
	return {
		key,
		raw: String(entry.raw || key),
		para: entry.para === null || entry.para === undefined ? null : Number(entry.para),
		kind: String(entry.kind || key.split(':')[0] || 'ref')
	};
}

/** @description Normalizes one reverse citation entry. @param {*} entry Raw entry. @returns {Object|null} Normalized {post, para, raw} or null. */
function normalizeReverseEntry(entry) {
	if (!entry || typeof entry !== 'object') return null;
	const post = String(entry.post || '').trim();
	if (!post) return null;
	return {
		post,
		para: entry.para === null || entry.para === undefined ? null : Number(entry.para),
		raw: String(entry.raw || '')
	};
}

/** @description Merges one forward document into the post map with dedupe. @param {*} doc Parsed forward file. @param {Map} forward Post map to fill. */
function ingestForward(doc, forward) {
	const table = doc && doc.forward;
	if (!table || typeof table !== 'object') throw new Error('forward file lacks .forward table');
	for (const postId of Object.keys(table)) {
		const rows = Array.isArray(table[postId]) ? table[postId] : [];
		let list = forward.get(postId);
		if (!list) {
			list = [];
			forward.set(postId, list);
		}
		const seen = new Set(list.map((e) => e.key + '|' + e.para + '|' + e.raw));
		for (const rawEntry of rows) {
			const entry = normalizeForwardEntry(rawEntry);
			if (!entry) continue;
			const sig = entry.key + '|' + entry.para + '|' + entry.raw;
			if (seen.has(sig)) continue;
			seen.add(sig);
			list.push(entry);
		}
	}
}

/** @description Merges one reverse document into the key map with dedupe. @param {*} doc Parsed reverse file. @param {Map} reverse Key map to fill. */
function ingestReverse(doc, reverse) {
	const table = doc && doc.index;
	if (!table || typeof table !== 'object') throw new Error('reverse file lacks .index table');
	for (const key of Object.keys(table)) {
		const rows = Array.isArray(table[key]) ? table[key] : [];
		let list = reverse.get(key);
		if (!list) {
			list = [];
			reverse.set(key, list);
		}
		const seen = new Set(list.map((e) => e.post + '|' + e.para + '|' + e.raw));
		for (const rawEntry of rows) {
			const entry = normalizeReverseEntry(rawEntry);
			if (!entry) continue;
			const sig = entry.post + '|' + entry.para + '|' + entry.raw;
			if (seen.has(sig)) continue;
			seen.add(sig);
			list.push(entry);
		}
	}
}

/**
 * @description Loads (or reuses the cached) merged citation data.
 * @param {string} [dir=INDEX_DIR] Index directory override (used by tests).
 * @returns {{forward: Map, reverse: Map, meta: Object}} Merged citation data.
 */
function loadConnectionsData(dir = INDEX_DIR) {
	const sig = dirSignature(dir);
	if (cached && cached.dir === dir && cached.sig === sig) return cached.data;

	const forward = new Map();
	const reverse = new Map();
	const meta = {
		dir,
		files: [],
		skipped: [],
		forwardPosts: 0,
		reverseKeys: 0,
		reverseEntries: 0,
		loadedAt: new Date().toISOString()
	};

	if (sig !== null) {
		const names = fs.readdirSync(dir).filter((n) => INDEX_FILE_RE.test(n)).sort();
		for (const name of names) {
			const filePath = path.join(dir, name);
			let doc;
			try {
				doc = readJsonFile(filePath);
			} catch (parseError) {
				meta.skipped.push({ file: name, reason: 'unparseable (possibly mid-write): ' + String((parseError && parseError.message) || parseError).slice(0, 120) });
				continue;
			}
			try {
				if (name.startsWith('forward_')) ingestForward(doc, forward);
				else ingestReverse(doc, reverse);
				meta.files.push(name);
			} catch (shapeError) {
				meta.skipped.push({ file: name, reason: 'unexpected shape: ' + String((shapeError && shapeError.message) || shapeError).slice(0, 120) });
			}
		}
	} else {
		meta.skipped.push({ file: '(directory)', reason: 'index directory unreadable: ' + dir });
	}

	meta.forwardPosts = forward.size;
	meta.reverseKeys = reverse.size;
	let entries = 0;
	for (const list of reverse.values()) entries += list.length;
	meta.reverseEntries = entries;

	const data = { forward, reverse, meta };
	cached = { dir, sig, data };
	return data;
}

/** @description Clears the loader cache (tests only). @returns {void} */
function clearConnectionsCache() {
	cached = null;
}

module.exports = { loadConnectionsData, clearConnectionsCache, INDEX_DIR };
