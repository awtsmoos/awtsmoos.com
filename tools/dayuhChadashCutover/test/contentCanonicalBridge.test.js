// B"H
// Boruch Hashem
// Blessed is He

/** @file contentCanonicalBridge.test.js @description Proves packed read-after-write. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const DosDB = require('../../../ayzarim/DosDB/index.js');
const {
	appendCanonicalRecords,
	seriesPath
} = require('../../../geelooy/api/social/helper/contentCanonicalBridge.js');

test('canonical series object reads immediately after append and update', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-canonical-content-'));
	const db = new DosDB(root);
	await db.init();
	const record = {
		id: 'post_one',
		postId: 'post_one',
		heichelId: 'heichel_one',
		seriesId: 'series_one',
		parentSeriesId: 'series_one',
		title: 'First title',
		content: 'First body'
	};
	const $i = { db };
	await appendCanonicalRecords({ $i, record });
	const logical = seriesPath(record);
	const first = await db.getValue(logical, record.id);
	assert.equal(first.content, 'First body');
	await db.updateEntry(logical, {
		key: record.id,
		value: { ...record, content: 'Updated body' }
	});
	const updated = await db.getValue(logical, record.id);
	assert.equal(updated.content, 'Updated body');
	const whole = await db.get(logical);
	assert.equal(whole[record.id].content, 'Updated body');
	fs.rmSync(root, { recursive: true, force: true });
});
