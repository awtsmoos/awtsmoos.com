//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves canonical site ids reveal only their mapped Drive roots. */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('../../api/social/helper/drive/test/testContext.js');
const { upsertSiteMapping } = require('../../api/social/helper/drive/siteMappingService.js');
const { writeDriveFile } = require('../../api/social/helper/drive/writeService.js');
const { buildSiteResponse } = require('../siteGateway.js');

async function write($i, path, content) {
	return writeDriveFile({ aliasId: 'alpha', path, content, visibility: 'public', $i });
}

function request($i, path, url) {
	return buildSiteResponse({ aliasId: 'alpha', path, url, method: 'GET', headers: {}, $i });
}

test('named canonical site serves its mapped root instead of the alias root', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-site-map-root-');
	await write($i, 'index.html', '<h1>Alias root</h1>');
	await write($i, 'docs-site/index.html', '<h1>Mapped docs</h1>');
	await upsertSiteMapping({
		aliasId: 'alpha',
		siteId: 'docs',
		input: { rootPath: 'docs-site', enabled: true },
		$i
	});
	const result = await request($i, 'docs', '/sites/alpha/docs/');
	assert.equal(result.statusCode, 200);
	assert.equal(result.response.toString(), '<h1>Mapped docs</h1>');
	assert.equal(result.headers['X-Awtsmoos-Site-Id'], 'docs');
});

test('primary canonical route scopes index and custom 404 to its mapped root', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-site-map-primary-');
	await write($i, 'primary/index.html', '<h1>Primary</h1>');
	await write($i, 'primary/404.html', '<h1>Primary lost</h1>');
	await write($i, '404.html', '<h1>Alias lost</h1>');
	await upsertSiteMapping({
		aliasId: 'alpha',
		siteId: 'home',
		input: { rootPath: 'primary', enabled: true, primary: true },
		$i
	});
	let result = await request($i, '', '/sites/alpha/');
	assert.equal(result.response.toString(), '<h1>Primary</h1>');
	result = await request($i, 'missing', '/sites/alpha/missing');
	assert.equal(result.statusCode, 404);
	assert.equal(result.response.toString(), '<h1>Primary lost</h1>');
});

test('disabled named site stays dark instead of falling through to primary path', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-site-map-disabled-');
	await write($i, 'docs/index.html', '<h1>Primary docs directory</h1>');
	await upsertSiteMapping({ aliasId: 'alpha', siteId: 'home', input: { primary: true }, $i });
	await upsertSiteMapping({
		aliasId: 'alpha',
		siteId: 'docs',
		input: { rootPath: 'elsewhere', enabled: false },
		$i
	});
	const result = await request($i, 'docs', '/sites/alpha/docs/');
	assert.equal(result.statusCode, 404);
	assert.equal(result.response.length, 0);
});
