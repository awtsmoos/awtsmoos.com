// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vector_nested_registry_bulk.test.js
 * @description
 * The Awtsmoos proves a vector write never seals a registry generation owned by
 * an immutable builder. Normal writes still seal their own generation, while a
 * bounded outer graph generation survives many insertions until its owner commits.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const AwtsmoosDB = require('../index.js');

/** Opens one disposable two-dimensional indexed list. */
async function fixture() {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-vector-bulk-'));
	const file = path.join(folder, 'candidate.awtsdb');
	const database = new AwtsmoosDB(file, { wal: false, compression: false });
	await database.open();
	await database.createList(database.root, 'records');
	database.vector.enable(database.root.records, {
		dimensions: 2,
		metric: 'cosine',
		reindex: false
	});
	return { database, file, folder };
}

test('ordinary vector insertion seals its own registry generation', async t => {
	const state = await fixture();
	t.after(async () => {
		await state.database.close();
		fs.rmSync(state.folder, { recursive: true, force: true });
	});
	const status = state.database.vector.indexStatus(state.database.root.records);
	state.database.root.records.push({ id: 'ordinary', vec: [1, 0] });
	assert.equal(status.index.registry.bulk, false);
	assert.equal(status.index.registry.count(), 1);
});

test('outer registry generation survives nested vector insertions', async t => {
	const state = await fixture();
	t.after(async () => {
		await state.database.close();
		fs.rmSync(state.folder, { recursive: true, force: true });
	});
	const list = state.database.root.records;
	const status = state.database.vector.indexStatus(list);
	status.index.registry.beginBulk();
	list.push({ id: 'first', vec: [1, 0] });
	list.push({ id: 'second', vec: [0, 1] });
	assert.equal(status.index.registry.bulk, true);
	assert.equal(status.index.registry.dirtyNodes.size > 0, true);
	status.index.registry.commitBulk();
	state.database.vector.persistIndex(status.path, status.index);
	await state.database.waitForIdle();
	assert.equal(status.index.registry.bulk, false);
	assert.equal(state.database.vector.auditIndex(list).registryCount, 2);
});
