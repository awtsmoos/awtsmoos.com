//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module LexiconBinaryRecordSchema
 * @description
 * Stable numeric field identities for one compact immutable lexical record.
 * Field names never repeat on disk; the decoder restores the familiar runtime
 * object shape from these single-byte identities.
 */

const RECORD_TAG = 0xA1;

const FIELDS = Object.freeze({
	headword: 1,
	normalized: 2,
	rid: 3,
	sourceId: 4,
	languageCode: 5,
	transliteration: 6,
	pronunciation: 7,
	morphology: 8,
	alternateHeadwords: 9,
	refs: 10,
	previousHeadword: 11,
	nextHeadword: 12,
	senses: 13,
	partOfSpeech: 14
});
const SENSE_FIELDS = Object.freeze({
	definition: 1,
	tags: 2,
	grammar: 3,
	senses: 4
});

const FIELD_NAMES = Object.freeze(
	Object.fromEntries(Object.entries(FIELDS).map(([name, id]) => [id, name]))
);

const SENSE_FIELD_NAMES = Object.freeze(
	Object.fromEntries(Object.entries(SENSE_FIELDS).map(([name, id]) => [id, name]))
);

const STRING_FIELDS = new Set([
	FIELDS.headword,
	FIELDS.normalized,
	FIELDS.rid,
	FIELDS.sourceId,
	FIELDS.languageCode,
	FIELDS.transliteration,
	FIELDS.pronunciation,
	FIELDS.morphology,
	FIELDS.previousHeadword,
	FIELDS.nextHeadword,
	FIELDS.partOfSpeech
]);
const LIST_FIELDS = new Set([
	FIELDS.alternateHeadwords,
	FIELDS.refs
]);

module.exports = {
	FIELDS,
	FIELD_NAMES,
	LIST_FIELDS,
	RECORD_TAG,
	SENSE_FIELDS,
	SENSE_FIELD_NAMES,
	STRING_FIELDS
};