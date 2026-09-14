//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file Bounded project database import tests.
 * @description Proves validation happens before mutation and failed imports compensate earlier writes.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const batch = require('../projectDatabaseBatch.js');

test('batch validation rejects duplicate keys and excessive document counts', () => {
	assert.throws(() => batch.normalizeDocuments([
		{ key: 'same', value: 1 },
		{ key: 'same', value: 2 }
	]), /PROJECT_DB_IMPORT_DUPLICATE_KEY/);
	const excessive = Array.from({ length: batch.MAX_BATCH_DOCUMENTS + 1 }, (_, index) => ({ key: `k${index}`, value: index }));
	assert.throws(() => batch.normalizeDocuments(excessive), /PROJECT_DB_IMPORT_TOO_MANY_DOCUMENTS/);
});

test('failed import restores prior values and removes newly created values', async () => {
	const data = new Map([['existing', { old: true }]]);
	let writes = 0;
	const scope = {
		getKey: async (_path, key) => data.get(key),
		setKey: async (_path, key, value) => {
			writes += 1;
			if (key === 'explode' && writes <= 3) throw new Error('WRITE_FAILED');
			data.set(key, value);
		},
		deleteKey: async (_path, key) => data.delete(key)
	};
	await assert.rejects(batch.importProjectDocuments(scope, {
		path: 'profiles',
		documents: [
			{ key: 'existing', value: { new: true } },
			{ key: 'new', value: { made: true } },
			{ key: 'explode', value: { nope: true } }
		]
	}), /WRITE_FAILED/);
	assert.deepEqual(data.get('existing'), { old: true });
	assert.equal(data.has('new'), false);
});

test('successful import reports only bounded mutation testimony', async () => {
	const data = new Map();
	const scope = {
		getKey: async (_path, key) => data.get(key),
		setKey: async (_path, key, value) => data.set(key, value),
		deleteKey: async (_path, key) => data.delete(key)
	};
	const result = await batch.importProjectDocuments(scope, { documents: [{ key: 'a', value: { n: 1 } }] });
	assert.deepEqual(result, { imported: 1, rolledBack: false });
	assert.deepEqual(data.get('a'), { n: 1 });
});
