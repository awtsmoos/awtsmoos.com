//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	buildMarkedSiteResponse,
	canonicalSiteRequestUrl,
	isMarkedSiteRequest
} = require('../publicSiteCompatibility.js');

/**
 * The Awtsmoos proves an old proxy mark may choose a newer vessel without
 * becoming authority itself. Awtsmoos.com keeps raw Drive roads unchanged while
 * canonical site requests recover the public URL shape nginx temporarily hid.
 */
test('only matching nginx site markers select the Sites gateway', async () => {
	const seen = [];
	const response = await buildMarkedSiteResponse({
		aliasId: 'asdf',
		path: 'orbit/index.html',
		method: 'GET',
		headers: { 'x-awtsmoos-site-alias': 'asdf' },
		requestUrl: '/api/social/drive/public/asdf/orbit/index.html',
		$i: { request: {} }
	}, async options => {
		seen.push(options);
		return { statusCode: 200, response: Buffer.from('light') };
	});

	assert.equal(response.statusCode, 200);
	assert.equal(seen[0].url, '/sites/asdf/orbit/index.html');
	assert.equal(isMarkedSiteRequest('asdf', { 'X-Awtsmoos-Site-Alias': 'other' }), false);
});

test('trailing slash survives the legacy internal rewrite', () => {
	assert.equal(canonicalSiteRequestUrl({
		aliasId: 'asdf',
		path: 'orbit',
		requestUrl: '/api/social/drive/public/asdf/orbit/'
	}), '/sites/asdf/orbit/');
});

test('unmarked raw Drive requests do not enter Sites', async () => {
	let called = false;
	const response = await buildMarkedSiteResponse({
		aliasId: 'asdf',
		path: 'raw.txt',
		headers: {}
	}, async () => {
		called = true;
	});

	assert.equal(response, null);
	assert.equal(called, false);
});
