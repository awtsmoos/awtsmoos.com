// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file aiSearch/vectorCorpus/reader.js
 * @chapter The Compact Seal Opens Into The Same Public Result
 * @description Reads the persisted compact-corpus manifest and decodes payloads.
 * Corpora without a manifest remain compatible ordinary AwtsmoosDB rows.
 */

const rowCodec = require('./rowCodec.js');
const MANIFEST_KEY = '__vector_corpus__';

function manifestOf(database) {
	const value = database?.root?.[MANIFEST_KEY];
	if (!value) return null;
	try { return value.__resolve__?.() ?? value; }
	catch { return value; }
}

function decode(database, row) {
	const manifest = manifestOf(database);
	return manifest?.codec ? rowCodec.decode(manifest.codec, row) : row;
}

function decodeHits(database, hits) {
	return Array.from(hits || []).map(hit => ({
		...hit,
		item: decode(database, hit.item)
	}));
}

module.exports = {
	MANIFEST_KEY,
	decode,
	decodeHits,
	manifestOf
};
