// B"H

/** @file installRollback.test.js @description Proves all-family install rollback. */

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { installBatch } = require('../installBatch.js');
const { rollbackPending } = require('../rollbackBatch.js');

function createDatabase(file, value) {
	const database = new AwtsmoosDB(file, { wal: false });
	database.open();
	database.root.value = value;
	database.close();
}

function readValue(file) {
	const database = new AwtsmoosDB(file, { readOnly: true, wal: false });
	database.open();
	try { return database.root.value; } finally { database.close(); }
}

function sha256(file) {
	return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function fixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-maintenance-'));
	const live = path.join(root, 'live');
	const candidates = path.join(root, 'candidates');
	fs.mkdirSync(live);
	fs.mkdirSync(candidates);
	return {
		root,
		policy: { workRoot: path.join(root, 'work') },
		items: ['posts', 'series'].map(family => ({
			family,
			source: path.join(live, `${family}.awtsdb`),
			candidate: path.join(candidates, `${family}.awtsdb`)
		}))
	};
}

test('installs two candidates then rolls them back as one batch', () => {
	const current = fixture();
	for (const item of current.items) {
		createDatabase(item.source, `old-${item.family}`);
		createDatabase(item.candidate, `new-${item.family}`);
	}
	const installations = installBatch(current.items, current.policy, 'run-1');
	assert.deepEqual(current.items.map(item => readValue(item.source)), [
		'new-posts',
		'new-series'
	]);
	rollbackPending({ pendingRunId: 'run-1', installations }, current.policy);
	assert.deepEqual(current.items.map(item => readValue(item.source)), [
		'old-posts',
		'old-series'
	]);
	fs.rmSync(current.root, { recursive: true, force: true });
});

test('verification failure restores every original automatically', () => {
	const current = fixture();
	for (const item of current.items) createDatabase(item.source, `old-${item.family}`);
	createDatabase(current.items[0].candidate, 'new-posts');
	fs.writeFileSync(current.items[1].candidate, 'not a database');
	const before = current.items.map(item => sha256(item.source));
	assert.throws(
		() => installBatch(current.items, current.policy, 'run-fail'),
		error => error.code === 'AWTSMOOS_MAINTENANCE_INSTALL_REFUSED'
	);
	assert.deepEqual(current.items.map(item => sha256(item.source)), before);
	fs.rmSync(current.root, { recursive: true, force: true });
});
