//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module connectionsIndexNormalize
 * @description
 * Citation index directory signature and forward/reverse entry normalization.
 */

const fs = require('fs');
const path = require('path');

const INDEX_DIR = path.join(__dirname, 'citationIndexes');
const INDEX_FILE_RE = /^(forward|reverse)_.+\.json$/;

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

module.exports = {
	INDEX_DIR,
	INDEX_FILE_RE,
	dirSignature,
	readJsonFile,
	normalizeForwardEntry,
	normalizeReverseEntry
};
