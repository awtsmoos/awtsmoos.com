//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module LexiconBinaryRecordWriter
 * @description
 * Encodes one canonical lexicon entry into a contiguous exact-length binary
 * record. Schema-known types avoid repeated field names and fixed-width padding;
 * only the requested record is materialized while the corpus remains on disk.
 */

const Leb128 = require('../../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/utils/leb128/scribe.js');
const {
	FIELDS,
	LIST_FIELDS,
	RECORD_TAG,
	SENSE_FIELDS,
	STRING_FIELDS
} = require('./recordSchema.js');

/** Encodes one unsigned integer using AwtsmoosDB's padding-free LEB128 form. */
function varUint(value) {
	const buffer = Buffer.allocUnsafe(Leb128.size(value));
	Leb128.write(buffer, 0, value);
	return buffer;
}

/** Encodes one UTF-8 string as variable byte length followed by exact bytes. */
function text(value) {
	const bytes = Buffer.from(String(value ?? ''), 'utf8');
	return Buffer.concat([varUint(bytes.length), bytes]);
}
/** Encodes one bounded list of strings without allocating empty list elements. */
function textList(values) {
	const list = Array.isArray(values)
		? values.map(value => String(value ?? '')).filter(Boolean)
		: [];
	return Buffer.concat([varUint(list.length), ...list.map(text)]);
}

/** Converts nested grammar transport values into stable human-readable text. */
function grammarText(value) {
	if (value == null) return '';
	if (Array.isArray(value)) return value.map(grammarText).filter(Boolean).join(' · ');
	if (typeof value === 'object') {
		return Object.entries(value)
			.map(([key, child]) => `${key}: ${grammarText(child)}`)
			.filter(value => !value.endsWith(': '))
			.join('; ');
	}
	return String(value);
}

/** Encodes grammar key/value pairs once, preserving source labels without JSON. */
function grammar(value) {
	const entries = value && typeof value === 'object'
		? Object.entries(value).map(([key, child]) => [key, grammarText(child)]).filter(([, child]) => child)
		: [];
	return Buffer.concat([
		varUint(entries.length),
		...entries.flatMap(([key, child]) => [text(key), text(child)])
	]);
}
/** Encodes one nested scholarly sense using schema-known field identities. */
function sense(value = {}) {
	const fields = [];
	if (value.definition) fields.push([SENSE_FIELDS.definition, text(value.definition)]);
	if (Array.isArray(value.tags) && value.tags.length) {
		fields.push([SENSE_FIELDS.tags, textList(value.tags)]);
	}
	if (value.grammar && typeof value.grammar === 'object') {
		fields.push([SENSE_FIELDS.grammar, grammar(value.grammar)]);
	}
	if (Array.isArray(value.senses) && value.senses.length) {
		fields.push([SENSE_FIELDS.senses, senses(value.senses)]);
	}
	return Buffer.concat([
		varUint(fields.length),
		...fields.flatMap(([id, payload]) => [Buffer.from([id]), payload])
	]);
}

/** Encodes a sense list as count followed by self-delimiting sense structures. */
function senses(values) {
	const list = Array.isArray(values) ? values : [];
	return Buffer.concat([varUint(list.length), ...list.map(sense)]);
}

/** Returns the schema-specific payload for one top-level lexical field. */
function fieldPayload(id, value) {
	if (STRING_FIELDS.has(id)) return text(value);
	if (LIST_FIELDS.has(id)) return textList(value);
	if (id === FIELDS.senses) return senses(value);
	throw new Error('lexicon_binary_unknown_field');
}
/** Encodes one canonical lexical entry into the compact version-one record. */
function encodeLexiconRecord(entry = {}) {
	const fields = Object.entries(FIELDS)
		.map(([name, id]) => [id, entry[name]])
		.filter(([id, value]) => id === FIELDS.senses
			? Array.isArray(value) && value.length > 0
			: Array.isArray(value) ? value.length > 0 : String(value ?? '').length > 0);
	return Buffer.concat([
		Buffer.from([RECORD_TAG]),
		varUint(fields.length),
		...fields.flatMap(([id, value]) => [Buffer.from([id]), fieldPayload(id, value)])
	]);
}

module.exports = {
	encodeLexiconRecord
};