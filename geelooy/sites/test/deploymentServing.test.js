//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Proves immutable deployment bytes survive mutable working-source changes.
 * @description
 * The Awtsmoos fixes production to content hashes while Awtsmoos.com keeps editing
 * free to continue; these tests exercise the real gateway, object store, HTTP
 * conditions, byte ranges, directory index, custom 404, new publish, and rollback.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { isolatedServing } = require('./deploymentServingFixture.js');

/** Seeds revision A with root, nested, and custom-not-found documents. */
async function seedRevisionA(site) {
	await site.write('index.html', 'REVISION-A-HOME');
	await site.write('about/index.html', 'REVISION-A-ABOUT');
	await site.write('404.html', 'REVISION-A-NOT-FOUND');
	await site.map();
	return site.publish('revision A');
}

test('production remains on immutable revision until another publish or rollback', async () => {
	await isolatedServing(async site => {
		const first = await seedRevisionA(site);
		const liveA = await site.request();
		assert.equal(liveA.statusCode, 200);
		assert.equal(liveA.response.toString(), 'REVISION-A-HOME');
		await site.write('index.html', 'REVISION-B-HOME');
		const stillA = await site.request();
		assert.equal(stillA.response.toString(), 'REVISION-A-HOME');
		const second = await site.publish('revision B');
		const liveB = await site.request();
		assert.equal(liveB.response.toString(), 'REVISION-B-HOME');
		await site.rollback(first.deployment.id);
		const rolledBack = await site.request();
		assert.equal(rolledBack.response.toString(), 'REVISION-A-HOME');
		assert.notEqual(first.deployment.id, second.deployment.id);
	});
});

test('immutable serving preserves ETag, Range, directories, and custom 404', async () => {
	await isolatedServing(async site => {
		await seedRevisionA(site);
		const home = await site.request();
		const etag = home.headers.ETag;
		assert.ok(etag);
		const unchanged = await site.request({ headers: { 'if-none-match': etag } });
		assert.equal(unchanged.statusCode, 304);
		assert.equal(unchanged.response.length, 0);
		const range = await site.request({ headers: { range: 'bytes=0-7' } });
		assert.equal(range.statusCode, 206);
		assert.equal(range.response.toString(), 'REVISION');
		const head = await site.request({ method: 'HEAD' });
		assert.equal(head.statusCode, 200);
		assert.equal(head.response.length, 0);
		assert.equal(head.headers['Content-Length'], String('REVISION-A-HOME'.length));
		const redirect = await site.request({
			path: 'about',
			url: '/sites/owner/home/about'
		});
		assert.equal(redirect.statusCode, 308);
		assert.equal(redirect.headers.Location, '/sites/owner/home/about/');
		const about = await site.request({
			path: 'about',
			url: '/sites/owner/home/about/'
		});
		assert.equal(about.statusCode, 200);
		assert.equal(about.response.toString(), 'REVISION-A-ABOUT');
		const missing = await site.request({ path: 'missing-page' });
		assert.equal(missing.statusCode, 404);
		assert.equal(missing.response.toString(), 'REVISION-A-NOT-FOUND');
		assert.equal(missing.headers['Cache-Control'], 'no-cache, must-revalidate');
	});
});
