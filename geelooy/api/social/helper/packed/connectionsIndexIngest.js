//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module connectionsIndexIngest
 * @description
 * Forward and reverse citation document ingestion with dedupe.
 */

const { normalizeForwardEntry, normalizeReverseEntry } = require('./connectionsIndexNormalize.js');

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

module.exports = {
	ingestForward,
	ingestReverse
};
