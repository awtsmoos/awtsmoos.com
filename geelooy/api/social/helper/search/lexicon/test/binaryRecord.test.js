//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file binaryRecord.test.js
 * @description
 * Proves compact lexical records preserve scholarly fields, reject corruption,
 * and never require generic JSON or fixed-width record padding.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	encodeLexiconRecord
} = require('../binary/recordWriter.js');
const {
	decodeLexiconRecord,
	isCompactLexiconRecord
} = require('../binary/recordReader.js');

/** Returns one nested Jastrow-shaped record with mixed variable-length fields. */
function jastrowFixture() {
	return {
		headword: 'אָב II ²',
		normalized: 'אב',
		rid: 'A00071',
		languageCode: 'heb.talmudic',
		transliteration: 'av',
		refs: ['Berakhot 2a'],
		previousHeadword: 'אָב II',
		nextHeadword: 'אָב III',
		senses: [{
			definition: 'father',
			grammar: { partOfSpeech: 'noun' },
			senses: [{ definition: 'ancestor' }]
		}]
	};
}

/** Proves a real nested lexical record survives exact compact round-trip. */
test('compact lexical record round-trips scholarly fields exactly', () => {
	const fixture = jastrowFixture();
	const encoded = encodeLexiconRecord(fixture);
	assert.equal(isCompactLexiconRecord(encoded), true);
	assert.deepEqual(decodeLexiconRecord(encoded), fixture);
	assert.ok(encoded.length < 256);
});

/** Proves malformed/truncated records fail closed instead of yielding partial data. */
test('compact lexical record rejects truncation and trailing bytes', () => {
	const encoded = encodeLexiconRecord(jastrowFixture());
	assert.throws(
		() => decodeLexiconRecord(encoded.subarray(0, encoded.length - 1)),
		/lexicon_binary_truncated_record/
	);
	assert.throws(
		() => decodeLexiconRecord(Buffer.concat([encoded, Buffer.from([0])])),
		/lexicon_binary_trailing_bytes/
	);
});

/** Proves repeated source metadata is not serialized inside each compact entry. */
test('compact lexical record omits shard-level source identity duplication', () => {
	const fixture = {
		...jastrowFixture(),
		sourceLexicon: 'Jastrow Dictionary'
	};
	const encoded = encodeLexiconRecord(fixture);
	const decoded = decodeLexiconRecord(encoded);
	assert.equal(decoded.sourceLexicon, undefined);
	assert.equal(encoded.includes(Buffer.from('Jastrow Dictionary')), false);
});
