// B"H
// Boruch Hashem
// Blessed is He

/** @file postWrapperRead.test.js @description Proves the exported posts wrapper. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const DosDB = require('../../../ayzarim/DosDB/index.js');
const createRoutes = require('../../../geelooy/api/social/_awtsmoos.posts.js');
const { appendCanonicalRecords } = require('../../../geelooy/api/social/helper/contentCanonicalBridge.js');

test('exported posts wrapper returns the packed record on GET', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-post-wrapper-'));
	const db = new DosDB(root);
	await db.init();
	const record = {
		id: 'post_one',
		postId: 'post_one',
		heichelId: 'heichel_one',
		seriesId: 'series_one',
		parentSeriesId: 'series_one',
		title: 'Updated title',
		content: 'Updated body'
	};
	const $i = {
		db,
		request: { method: 'GET' },
		$_GET: {},
		$_POST: {},
		$_PUT: {},
		$_DELETE: {}
	};
	await appendCanonicalRecords({ $i, record });
	const routes = createRoutes({ $i, userid: 'fixture' });
	const result = await routes[
		'/heichelos/:heichel/series/:series/post/:post'
	]({ heichel: record.heichelId, series: record.seriesId, post: record.id });
	assert.equal(result.content, 'Updated body');
	fs.rmSync(root, { recursive: true, force: true });
});
