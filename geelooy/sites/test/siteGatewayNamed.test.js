//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves named sites inherit the same public byte law as the primary site;
 * Awtsmoos.com keeps ranges, MIME, 404s, and disabled mappings inside the owned root.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('../../api/social/helper/drive/test/testContext.js');
const { upsertSiteMapping } = require('../../api/social/helper/drive/siteMappingService.js');
const { writeDriveFile } = require('../../api/social/helper/drive/writeService.js');
const { buildSiteResponse } = require('../siteGateway.js');

async function write($i, path, content, visibility = 'public') {
	return writeDriveFile({ aliasId: 'alpha', path, content, visibility, $i });
}

async function map($i, siteId, rootPath, input = {}) {
	return upsertSiteMapping({
		aliasId: 'alpha',
		siteId,
		input: { rootPath, enabled: true, ...input },
		$i
	});
}

function request($i, path, url, method = 'GET', headers = {}) {
	return buildSiteResponse({ aliasId: 'alpha', path, url, method, headers, $i });
}

test('explicit primary mapping serves legacy alias root from its rootPath', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-named-primary-');
	await map($i, 'main', 'www', { primary: true });
	await write($i, 'www/index.html', '<h1>Main</h1>');
	const result = await request($i, '', '/sites/alpha/');
	assert.equal(result.statusCode, 200);
	assert.equal(result.response.toString(), '<h1>Main</h1>');
	assert.equal(result.headers['X-Awtsmoos-Site-Id'], undefined);
});

test('explicit named mapping redirects root then serves its own index', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-named-root-');
	await map($i, 'main', 'www', { primary: true });
	await map($i, 'docs', 'manual');
	await write($i, 'manual/index.html', '<h1>Docs</h1>');
	let result = await request($i, 'docs', '/sites/alpha/docs');
	assert.equal(result.statusCode, 308);
	assert.equal(result.headers.Location, '/sites/alpha/docs/');
	result = await request($i, 'docs', '/sites/alpha/docs/');
	assert.equal(result.response.toString(), '<h1>Docs</h1>');
	assert.equal(result.headers['X-Awtsmoos-Site-Id'], 'docs');
});

test('named assets preserve ranges and MIME', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-named-range-');
	await map($i, 'main', 'www', { primary: true });
	await map($i, 'docs', 'manual');
	await write($i, 'manual/app.js', 'abcdef');
	const result = await request(
		$i,
		'docs/app.js',
		'/sites/alpha/docs/app.js',
		'GET',
		{ range: 'bytes=1-3' }
	);
	assert.equal(result.statusCode, 206);
	assert.equal(result.response.toString(), 'bcd');
	assert.match(result.headers['Content-Type'], /javascript/);
	assert.equal(result.headers['X-Awtsmoos-Site-Id'], 'docs');
});

test('named missing path uses mapping-local public 404', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-named-404-');
	await map($i, 'main', 'www', { primary: true });
	await map($i, 'docs', 'manual');
	await write($i, 'manual/404.html', '<h1>Docs lost</h1>');
	const result = await request($i, 'docs/missing', '/sites/alpha/docs/missing');
	assert.equal(result.statusCode, 404);
	assert.equal(result.response.toString(), '<h1>Docs lost</h1>');
});

test('disabled named mapping is generic 404 and cannot fall through', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-named-disabled-');
	await map($i, 'main', 'www', { primary: true });
	await map($i, 'docs', 'manual', { enabled: false });
	await write($i, 'www/docs/index.html', '<h1>Wrong</h1>');
	const result = await request($i, 'docs', '/sites/alpha/docs/');
	assert.equal(result.statusCode, 404);
	assert.equal(result.headers['X-Awtsmoos-Site-Id'], undefined);
	assert.notEqual(result.response?.toString(), '<h1>Wrong</h1>');
});
