//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos joins Manager words to canonical session, stream, site, and path
 * gates; Awtsmoos.com proves the client does not duplicate bytes or save secrets.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const driveRoot = path.resolve(__dirname, '../../../../../apps/drive');
const readClient = name => fs.readFileSync(path.join(driveRoot, 'js', name), 'utf8');
const readStyle = name => fs.readFileSync(path.join(driveRoot, 'styles', name), 'utf8');
const readDrive = name => fs.readFileSync(path.resolve(__dirname, '..', name), 'utf8');
const indexSource = fs.readFileSync(path.join(driveRoot, 'index.html'), 'utf8');
const actionsSource = readClient('actions.js');
const uploadsSource = readClient('uploads.js');
const streamSource = readClient('streamUpload.js');
const apiSource = readClient('api.js');
const transportSource = readClient('apiTransport.js');
const stateSource = readClient('state.js');

function allClientSource() {
	return fs.readdirSync(path.join(driveRoot, 'js'))
		.filter(name => name.endsWith('.js'))
		.map(readClient)
		.join('\n');
}

test('Manager streams raw files without base64 duplication', () => {
	assert.match(streamSource, /XMLHttpRequest/);
	assert.match(streamSource, /request\.open\('PUT'/);
	assert.match(streamSource, /request\.send\(options\.file\)/);
	assert.match(streamSource, /idempotency-key/);
	assert.match(streamSource, /x-drive-visibility/);
	assert.doesNotMatch(`${uploadsSource}\n${streamSource}`, /FileReader|contentBase64|readAsDataURL/);
});

test('session identity is default while explicit credentials remain in memory', () => {
	assert.match(indexSource, /value="session"/);
	assert.match(stateSource, /credentialType:\s*'session'/);
	assert.match(apiSource, /apiTransport\.js/);
	assert.match(transportSource, /credentials:\s*'same-origin'/);
	assert.match(transportSource, /x-awtsmoos-api-key/);
	assert.match(transportSource, /Bearer/);
	assert.doesNotMatch(allClientSource(), /localStorage|sessionStorage|indexedDB/);
});

test('site publication and modular visual system are first class', () => {
	assert.match(apiSource, /\/site/);
	assert.match(apiSource, /\/sites\//);
	assert.match(indexSource, /id="site-url"/);
	assert.match(indexSource, /id="website-mode"/);
	for (const name of ['tokens', 'base', 'layout', 'components', 'responsive', 'accessibility']) {
		assert.match(indexSource, new RegExp(`styles/${name}\\.css`));
		assert.ok(readStyle(`${name}.css`).length > 40);
	}
});

test('canonical folder, move, copy, and streaming contracts agree', () => {
	const entryRoute = readDrive('routes/entryRoutes.js');
	const actionRoute = readDrive('routes/actionRoutes.js');
	assert.match(actionsSource, /type:\s*'folder'/);
	assert.match(actionsSource, /entry\.type\s*===\s*'folder'/);
	assert.match(entryRoute, /body\.type\s*===\s*'folder'/);
	assert.match(actionsSource, /fromPath:/);
	assert.match(actionsSource, /toPath:/);
	assert.match(actionRoute, /body\.fromPath/);
	assert.match(actionRoute, /body\.toPath/);
	assert.match(actionsSource, /Promise\.race/);
});
