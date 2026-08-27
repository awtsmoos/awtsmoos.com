//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves site status reveals readiness without private inventory. */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const { writeDriveFile } = require('../writeService.js');
const { getDriveSiteStatus } = require('../siteStatusService.js');

async function write($i, path, content, visibility) {
	return writeDriveFile({ aliasId: 'alpha', path, content, visibility, $i });
}

test('site status reports deterministic URL and public readiness', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-site-status-');
	await write($i, 'index.html', '<h1>B"H</h1>', 'public');
	await write($i, 'assets/app.js', 'export default 1', 'public');
	await write($i, 'private.txt', 'hidden', 'private');
	const result = await getDriveSiteStatus('alpha', $i);
	assert.equal(result.ready, true);
	assert.equal(result.sitePath, '/sites/alpha/');
	assert.equal(result.entryPoint, 'index.html');
	assert.equal(result.publicFileCount, 2);
	assert.equal(result.relativeLinksSupported, true);
	assert.equal(result.rootRelativeLinksSupported, false);
});

test('site status remains not ready until index.html is public', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-site-unready-');
	await write($i, 'index.html', '<h1>Private</h1>', 'private');
	const result = await getDriveSiteStatus('alpha', $i);
	assert.equal(result.ready, false);
	assert.equal(result.entryPoint, null);
	assert.equal(result.publicFileCount, 0);
});
