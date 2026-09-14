//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module LexiconBinaryRecordReader
 * @description
 * Decodes one schema-coded lexical record without consulting corpus-sized
 * state. Unknown fields and malformed lengths fail closed instead of yielding
 * partial scholarly data.
 */

const RecordCursor = require('./recordCursor.js');
const {
	FIELDS,
	FIELD_NAMES,
	LIST_FIELDS,
	RECORD_TAG,
	SENSE_FIELDS,
	SENSE_FIELD_NAMES,
	STRING_FIELDS
} = require('./recordSchema.js');

/** Reads one variable-length string list. */
function textList(cursor) {
	const count = cursor.uint();
	const output = [];
	for (let index = 0; index < count; index += 1) output.push(cursor.text());
	return output;
}

/** Reads grammar pairs encoded without generic object serialization. */
function grammar(cursor) {
	const count = cursor.uint();
	const output = {};
	for (let index = 0; index < count; index += 1) {
		const key = cursor.text();
		output[key] = cursor.text();
	}
	return output;
}

/** Decodes one nested scholarly sense. */
function sense(cursor) {
	const count = cursor.uint();
	const output = {};
	for (let index = 0; index < count; index += 1) {
		readSenseField(cursor, output, cursor.byte());
	}
	return output;
}

/** Reads a bounded list of nested senses. */
function senses(cursor) {
	const count = cursor.uint();
	const output = [];
	for (let index = 0; index < count; index += 1) output.push(sense(cursor));
	return output;
}

/** Applies one known sense field using its schema-implied payload type. */
function readSenseField(cursor, output, id) {
	const name = SENSE_FIELD_NAMES[id];
	if (!name) throw new Error('lexicon_binary_unknown_sense_field');
	if (id === SENSE_FIELDS.definition) output[name] = cursor.text();
	else if (id === SENSE_FIELDS.tags) output[name] = textList(cursor);
	else if (id === SENSE_FIELDS.grammar) output[name] = grammar(cursor);
	else if (id === SENSE_FIELDS.senses) output[name] = senses(cursor);
	else throw new Error('lexicon_binary_unknown_sense_field');
}

/** Applies one known top-level field using its schema-implied payload type. */
function readField(cursor, output, id) {
	const name = FIELD_NAMES[id];
	if (!name) throw new Error('lexicon_binary_unknown_field');
	if (STRING_FIELDS.has(id)) output[name] = cursor.text();
	else if (LIST_FIELDS.has(id)) output[name] = textList(cursor);
	else if (id === FIELDS.senses) output[name] = senses(cursor);
	else throw new Error('lexicon_binary_unknown_field');
}

/** Returns true only for the compact lexical record format handled here. */
function isCompactLexiconRecord(value) {
	return Buffer.isBuffer(value) && value.length > 0 && value[0] === RECORD_TAG;
}

/** Decodes one complete compact lexical record and rejects trailing bytes. */
function decodeLexiconRecord(value) {
	const cursor = new RecordCursor(value);
	if (cursor.byte() !== RECORD_TAG) throw new Error('lexicon_binary_invalid_tag');
	const fieldCount = cursor.uint();
	const output = {};
	for (let index = 0; index < fieldCount; index += 1) {
		readField(cursor, output, cursor.byte());
	}
	cursor.assertFinished();
	return output;
}

module.exports = {
	decodeLexiconRecord,
	isCompactLexiconRecord
};
