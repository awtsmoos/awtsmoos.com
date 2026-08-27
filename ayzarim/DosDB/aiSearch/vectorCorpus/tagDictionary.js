// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file aiSearch/vectorCorpus/tagDictionary.js
 * @chapter Repeated Names Become Small Numbers Without Losing One Meaning
 * @description Builds deterministic sorted dictionaries for measured tag fields
 * and provides stable encode/decode operations across reopen and migration.
 */

function build(rows, fields) {
	const dictionaries = {};
	for (const field of fields || []) {
		const values = new Set();
		for (const row of rows || []) {
			const value = row?.[field];
			if (value !== undefined && value !== null) values.add(canonical(value));
		}
		dictionaries[field] = Array.from(values).sort();
	}
	return {
		fields: Array.from(fields || []),
		dictionaries
	};
}

function indexes(codec) {
	const output = {};
	for (const field of codec.fields || []) {
		output[field] = new Map((codec.dictionaries?.[field] || []).map((value, index) => [value, index]));
	}
	return output;
}

function encode(codec, maps, row) {
	return (codec.fields || []).map(field => {
		const value = row?.[field];
		if (value === undefined || value === null) return -1;
		const index = maps[field]?.get(canonical(value));
		if (!Number.isInteger(index)) throw new Error(`B"H missing tag dictionary value: ${field}`);
		return index;
	});
}

function decode(codec, encoded) {
	const output = {};
	for (let index = 0; index < (codec.fields || []).length; index++) {
		const dictionaryId = Number(encoded?.[index] ?? -1);
		if (dictionaryId < 0) continue;
		const field = codec.fields[index];
		const value = codec.dictionaries?.[field]?.[dictionaryId];
		if (value === undefined) throw new Error(`B"H invalid tag dictionary id: ${field}/${dictionaryId}`);
		output[field] = restore(value);
	}
	return output;
}

function canonical(value) {
	return `${typeof value}:${String(value)}`;
}

function restore(value) {
	const separator = value.indexOf(':');
	const type = value.slice(0, separator);
	const text = value.slice(separator + 1);
	if (type === 'number') return Number(text);
	if (type === 'boolean') return text === 'true';
	return text;
}

module.exports = {
	build,
	decode,
	encode,
	indexes
};
