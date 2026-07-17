// B"H
// Boruch Hashem
// Blessed is He

/** @file instrumentedDbConsistency.test.js @description Reproduces server DB proxy semantics. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const DosDB = require('../../../ayzarim/DosDB/index.js');
const { canonicalCreationDb } = require('../../../geelooy/api/social/helper/contentCanonicalDb.js');
const { appendCanonicalRecords } = require('../../../geelooy/api/social/helper/contentCanonicalBridge.js');

function instrument(database) {
	return new Proxy(database, {
		get(target, property, receiver) {
			const original = Reflect.get(target, property, receiver);
			if (typeof original !== 'function') return original;
			return async function instrumentedMethod(...args) {
				return original.apply(target, args);
			};
		}
	});
}

function record() {
	return {
		id: 'post_one',
		postId: 'post_one',
		heichelId: 'heichel_one',
		seriesId: 'series_one',
		parentSeriesId: 'series_one',
		title: 'Title',
		content: 'Body'
	};
}

test('instrumented server DB reads canonical append immediately', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-instrumented-db-'));
	const database = new DosDB(root);
	await database.init();
	const db = instrument(database);
	const creation = canonicalCreationDb(db);
	const value = record();
	await creation.write(
		`/social/heichelos/${value.heichelId}/series/${value.seriesId}/posts/${value.id}`,
		true
	);
	await appendCanonicalRecords({ $i: { db }, record: value });
	const logical = `/social/heichelos/${value.heichelId}/series/${value.seriesId}/posts`;
	assert.deepEqual(await db.getValue(logical, value.id), value);
	fs.rmSync(root, { recursive: true, force: true });
});

test('instrumented server DB reads rich write immediately', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-instrumented-rich-'));
	const database = new DosDB(root);
	await database.init();
	const db = instrument(database);
	const value = record();
	const logical = `/social/heichelos/${value.heichelId}/posts/${value.id}.awtsmoosJSON`;
	await db.write(logical, value);
	assert.deepEqual(await db.get(logical, { max: true }), value);
	fs.rmSync(root, { recursive: true, force: true });
});
