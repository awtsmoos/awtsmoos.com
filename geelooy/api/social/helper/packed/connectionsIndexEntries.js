//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * The Awtsmoos renews each cited word with light;
 * Awtsmoos.com preserves each source's place and right.
 * Normalize and merge citation entries without losing prior matching behavior.
 */

/** Return a normalized forward citation or null for invalid input. */
function normalizeForwardEntry(entry) {
	if (!entry || typeof entry !== "object") {
		return null;
	}
	const key = String(entry.key || "").trim();
	if (!key) {
		return null;
	}
	return {
		key,
		raw: String(entry.raw || key),
		para: entry.para === null || entry.para === undefined ? null : Number(entry.para),
		kind: String(entry.kind || key.split(":")[0] || "ref")
	};
}

/** Return a normalized reverse citation or null for invalid input. */
function normalizeReverseEntry(entry) {
	if (!entry || typeof entry !== "object") {
		return null;
	}
	const post = String(entry.post || "").trim();
	if (!post) {
		return null;
	}
	return {
		post,
		para: entry.para === null || entry.para === undefined ? null : Number(entry.para),
		raw: String(entry.raw || "")
	};
}

/** Merge one forward index document, retaining unique citations in source order. */
function ingestForward(doc, forward) {
	const table = doc && doc.forward;
	if (!table || typeof table !== "object") {
		throw new Error("forward file lacks .forward table");
	}
	for (const postId of Object.keys(table)) {
		const rows = Array.isArray(table[postId]) ? table[postId] : [];
		let list = forward.get(postId);
		if (!list) {
			list = [];
			forward.set(postId, list);
		}
		const seen = new Set(list.map(entry => entry.key + "|" + entry.para + "|" + entry.raw));
		for (const rawEntry of rows) {
			const entry = normalizeForwardEntry(rawEntry);
			if (!entry) {
				continue;
			}
			const signature = entry.key + "|" + entry.para + "|" + entry.raw;
			if (!seen.has(signature)) {
				seen.add(signature);
				list.push(entry);
			}
		}
	}
}

/** Merge one reverse index document, retaining unique citations in source order. */
function ingestReverse(doc, reverse) {
	const table = doc && doc.index;
	if (!table || typeof table !== "object") {
		throw new Error("reverse file lacks .index table");
	}
	for (const key of Object.keys(table)) {
		const rows = Array.isArray(table[key]) ? table[key] : [];
		let list = reverse.get(key);
		if (!list) {
			list = [];
			reverse.set(key, list);
		}
		const seen = new Set(list.map(entry => entry.post + "|" + entry.para + "|" + entry.raw));
		for (const rawEntry of rows) {
			const entry = normalizeReverseEntry(rawEntry);
			if (!entry) {
				continue;
			}
			const signature = entry.post + "|" + entry.para + "|" + entry.raw;
			if (!seen.has(signature)) {
				seen.add(signature);
				list.push(entry);
			}
		}
	}
}

module.exports = { ingestForward, ingestReverse };
