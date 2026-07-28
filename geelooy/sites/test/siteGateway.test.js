//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves every alias website keeps public path law. */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('../../api/social/helper/drive/test/testContext.js');
const { writeDriveFile } = require('../../api/social/helper/drive/writeService.js');
const { buildSiteResponse } = require('../siteGateway.js');

function request($i, path = '', url = '/sites/alpha/', method = 'GET', headers = {}) {
	return buildSiteResponse({ aliasId: 'alpha', path, url, method, headers, $i });
}

async function write($i, path, content, visibility = 'public') {
	return writeDriveFile({ aliasId: 'alpha', path, content, visibility, $i });
}

test('root and implicit folders redirect before serving public index files', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-site-index-');
	await write($i, 'index.html', '<h1>Home</h1>');
	await write($i, 'docs/index.html', '<h1>Docs</h1>');
	let result = await request($i, '', '/sites/alpha');
	assert.equal(result.statusCode, 308);
	assert.equal(result.headers.Location, '/sites/alpha/');
	result = await request($i);
	assert.equal(result.statusCode, 200);
	assert.equal(result.response.toString(), '<h1>Home</h1>');
	result = await request($i, 'docs', '/sites/alpha/docs');
	assert.equal(result.statusCode, 308);
	assert.equal(result.headers.Location, '/sites/alpha/docs/');
	result = await request($i, 'docs', '/sites/alpha/docs/');
	assert.equal(result.response.toString(), '<h1>Docs</h1>');
});

test('nested files preserve ranges, MIME, and site identity', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-site-range-');
	await write($i, 'assets/app.js', 'abcdef');
	const result = await request(
		$i,
		'assets/app.js',
		'/sites/alpha/assets/app.js',
		'GET',
		{ range: 'bytes=1-3' }
	);
	assert.equal(result.statusCode, 206);
	assert.equal(result.response.toString(), 'bcd');
	assert.match(result.headers['Content-Type'], /javascript/);
	assert.equal(result.headers['X-Awtsmoos-Site-Alias'], 'alpha');
});

test('private files stay hidden and public custom 404 keeps status 404', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-site-private-');
	await write($i, 'secret.txt', 'hidden', 'private');
	await write($i, '404.html', '<h1>Lost</h1>');
	const result = await request($i, 'secret.txt', '/sites/alpha/secret.txt');
	assert.equal(result.statusCode, 404);
	assert.equal(result.response.toString(), '<h1>Lost</h1>');
	assert.equal(result.headers['Cache-Control'], 'no-cache, must-revalidate');
});

test('site gateway accepts only GET and HEAD', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-site-method-');
	const result = await request($i, '', '/sites/alpha/', 'POST');
	assert.equal(result.statusCode, 405);
	assert.equal(result.headers.Allow, 'GET, HEAD');
});
