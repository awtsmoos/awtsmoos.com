//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module connectionsIndexLoad
 * @description
 * Cached merged citation index loading and cache clearing.
 */

const fs = require('fs');
const path = require('path');

const { INDEX_DIR, INDEX_FILE_RE, dirSignature, readJsonFile } = require('./connectionsIndexNormalize.js');
const { ingestForward, ingestReverse } = require('./connectionsIndexIngest.js');

let cached = null; // { dir, sig, data }

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

module.exports = {
	loadConnectionsData,
	clearConnectionsCache
};
