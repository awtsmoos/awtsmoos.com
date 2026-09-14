//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file projectDatabaseDocuments.test.js
 * @description Proves collection previews stay count-bounded and byte-bounded before Database Studio receives them.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { listProjectDocuments, MAX_DOCUMENT_LIMIT, MAX_RESPONSE_BYTES } = require('../projectDatabaseDocuments.js');

/** @param {number} count Number of fake documents. @param {number} valueSize Optional payload size. @returns {object} Scoped DB fixture. */
function scope(count, valueSize = 0) {
	const keys = Array.from({ length: count }, (_, index) => `doc-${index}`);
	return {
		list: async () => keys,
		getKey: async (_path, key) => ({ key, payload: 'x'.repeat(valueSize) })
	};
}

test('document preview never exceeds the server maximum count', async () => {
	const result = await listProjectDocuments(scope(MAX_DOCUMENT_LIMIT + 30), { limit: 9999 });
	assert.equal(result.documents.length, MAX_DOCUMENT_LIMIT);
	assert.equal(result.total, MAX_DOCUMENT_LIMIT + 30);
	assert.equal(result.truncated, true);
});

test('document preview stops before its aggregate response byte ceiling', async () => {
	const result = await listProjectDocuments(scope(100, 50000), { limit: 100 });
	assert.ok(result.documents.length < 100);
	assert.ok(result.responseBytes <= MAX_RESPONSE_BYTES);
	assert.equal(result.truncated, true);
});

test('document preview accepts a page offset without loading prior documents', async () => {
	const result = await listProjectDocuments(scope(12), { limit: 4, offset: 4 });
	assert.deepEqual(result.documents.map(document => document.key), ['doc-4', 'doc-5', 'doc-6', 'doc-7']);
	assert.equal(result.offset, 4);
	assert.equal(result.previousOffset, 0);
	assert.equal(result.nextOffset, 8);
});

test('byte-limited page resumes at the first document that was not returned', async () => {
	const result = await listProjectDocuments(scope(100, 50000), { limit: 100, offset: 7 });
	assert.ok(result.documents.length > 0);
	assert.ok(result.documents.length < 100);
	assert.equal(result.nextOffset, 7 + result.documents.length);
});

