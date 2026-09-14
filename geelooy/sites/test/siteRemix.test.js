//B"H
//Boruch Hashem
//Blessed be He

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('../../api/social/helper/drive/test/testContext.js');
const { writeDriveFile } = require('../../api/social/helper/drive/writeService.js');
const { buildSiteResponse } = require('../siteGateway.js');
const { isolatedServing } = require('./deploymentServingFixture.js');

/** Proves public Site source can become a bounded remix without exposing private or partial work. */
function request($i, path = '__awtsmoos/remix.json', method = 'GET') {
	return buildSiteResponse({
		aliasId: 'alpha',
		path,
		url: `/sites/alpha/${path}`,
		method,
		headers: {},
		$i
	});
}

async function write($i, path, content, visibility = 'public', mime) {
	return writeDriveFile({ aliasId: 'alpha', path, content, visibility, mime, $i });
}

function body(result) {
	return JSON.parse(result.response.toString());
}

test('primary Site remix returns only complete public text source', async t => {
	const { $i } = createDriveTestContext(t, 'awts-remix-primary-');
	await write($i, 'index.html', '<h1>B"H</h1>');
	await write($i, 'site.js', '//B"H\nconsole.log("ready")');
	await write($i, 'private.txt', 'secret', 'private');
	const result = await request($i);
	const payload = body(result);
	assert.equal(result.statusCode, 200);
	assert.equal(payload.ok, true);
	assert.equal(payload.manifest.canonicalUrl, '/sites/alpha/');
	assert.deepEqual(payload.manifest.files.map(file => file.path).sort(), ['index.html', 'site.js']);
	assert.doesNotMatch(JSON.stringify(payload), /secret/);
});

test('binary public assets fail closed instead of producing a broken remix', async t => {
	const { $i } = createDriveTestContext(t, 'awts-remix-binary-');
	await write($i, 'index.html', '<img src="hero.png">');
	await write($i, 'hero.png', Buffer.from([1, 2, 3]), 'public', 'image/png');
	const result = await request($i);
	const payload = body(result);
	assert.equal(result.statusCode, 409);
	assert.equal(payload.error, 'REMIX_BINARY_ASSETS_UNSUPPORTED');
	assert.deepEqual(payload.paths, ['hero.png']);
});

test('remix endpoint is read-only', async t => {
	const { $i } = createDriveTestContext(t, 'awts-remix-method-');
	await write($i, 'index.html', '<h1>Home</h1>');
	const result = await request($i, '__awtsmoos/remix.json', 'POST');
	assert.equal(result.statusCode, 405);
	assert.equal(result.headers.Allow, 'GET, HEAD');
});

test('immutable deployment remix keeps the deployed revision after editable source changes', async () => {
	await isolatedServing(async fixture => {
		await fixture.write('index.html', '<h1>Version one</h1>');
		await fixture.write('site.js', '//B"H\nconst version = 1;');
		await fixture.map();
		await fixture.publish('v1');
		await fixture.write('index.html', '<h1>Version two draft</h1>');
		const result = await fixture.request({ path: '__awtsmoos/remix.json' });
		const payload = body(result);
		assert.equal(payload.ok, true);
		assert.equal(payload.manifest.sourceKind, 'drive-deployment');
		assert.match(payload.manifest.sourceRevision, /^d-/);
		assert.match(payload.manifest.files.find(file => file.path === 'index.html').content, /Version one/);
		assert.doesNotMatch(JSON.stringify(payload), /Version two draft/);
	});
});
