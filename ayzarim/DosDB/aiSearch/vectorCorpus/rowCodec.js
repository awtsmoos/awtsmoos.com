// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file aiSearch/vectorCorpus/rowCodec.js
 * @chapter Compact Tuples Unfold From Live Handles Into The Same Public Words
 * @description Encodes tag dictionaries and uncommon metadata separately while
 * materializing AwtsmoosDB live values before deterministic decoding.
 */

const tagDictionary = require('./tagDictionary.js');
const VECTOR_FIELDS = new Set(['vec', 'vector', 'embedding']);

function create(rows, fields) {
	return {
		version: 1,
		format: 'awtsmoos-compact-vector-payload',
		tags: tagDictionary.build(rows, fields)
	};
}

function encoder(codec) {
	const maps = tagDictionary.indexes(codec.tags);
	return row => encode(codec, maps, row);
}

function encode(codec, maps, row) {
	const data = {};
	for (const [field, value] of Object.entries(row || {})) {
		if (VECTOR_FIELDS.has(field)) continue;
		if (codec.tags.fields.includes(field)) continue;
		data[field] = value;
	}
	return {
		c: 1,
		t: tagDictionary.encode(codec.tags, maps, row),
		d: data
	};
}

function decode(codec, input) {
	const row = materialize(input);
	if (!isCompact(row)) return row;
	return {
		...materialize(row.d),
		...tagDictionary.decode(codec.tags, materialize(row.t))
	};
}

function isCompact(input) {
	const row = materialize(input);
	const tags = materialize(row?.t);
	const data = materialize(row?.d);
	return Boolean(row?.c === 1 && Array.isArray(tags) && data && typeof data === 'object');
}

function materialize(value) {
	if (!value) return value;
	try { return value.__resolve__?.() ?? value; }
	catch { return value; }
}

module.exports = {
	create,
	decode,
	encoder,
	isCompact,
	materialize
};
