//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Manager client boundary contract.
 * @description
 * The Awtsmoos keeps ordinary files simple while deeper authority receives its
 * own chamber; Awtsmoos.com proves streaming, identity, publication, and path
 * contracts without leaking advanced machinery back into the Files home.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const driveRoot = path.resolve(__dirname, '../../../../../apps/drive');
const readClient = name => fs.readFileSync(path.join(driveRoot, 'js', name), 'utf8');
const readStyle = name => fs.readFileSync(path.join(driveRoot, 'styles', name), 'utf8');
const readDrive = name => fs.readFileSync(path.resolve(__dirname, '..', name), 'utf8');
const filesSource = fs.readFileSync(path.join(driveRoot, 'index.html'), 'utf8');
const advancedSource = fs.readFileSync(path.join(driveRoot, 'advanced.html'), 'utf8');
const actionsSource = readClient('actions.js');
const uploadsSource = readClient('uploads.js');
const streamSource = readClient('streamUpload.js');
const apiSource = readClient('api.js');
const transportCoreSource = readClient('api/KeterDriveTransport.js');
const siteResourceSource = readClient('api/AsiyahSitesResource.js');
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

test('session identity stays default while explicit credentials remain Advanced and in memory', () => {
	assert.doesNotMatch(filesSource, /credential-type|credential-field|value="session"/);
	assert.match(advancedSource, /id="credential-type"/);
	assert.match(advancedSource, /value="session"/);
	assert.match(stateSource, /credentialType:\s*'session'/);
	assert.match(apiSource, /apiTransport\.js/);
	assert.match(transportCoreSource, /credentials:\s*'same-origin'/);
	assert.match(transportCoreSource, /x-awtsmoos-api-key/);
	assert.match(transportCoreSource, /Bearer/);
	assert.doesNotMatch(allClientSource(), /localStorage|sessionStorage|indexedDB/);
});

test('site publication is first class in Advanced while Files keeps one visual family', () => {
	assert.match(siteResourceSource, /\/site/);
	assert.match(siteResourceSource, /\/sites/);
	assert.doesNotMatch(filesSource, /id="site-url"|id="website-mode"/);
	assert.match(advancedSource, /id="site-url"/);
	assert.match(advancedSource, /id="website-mode"/);
	assert.match(filesSource, /styles\/drive-v5\.css/);
	assert.match(advancedSource, /styles\/advanced-drive\.css/);
	assert.ok(readStyle('drive-v5.css').length > 40);
	assert.ok(readStyle('advanced-drive.css').length > 40);
});

test('canonical folder, move, copy, and streaming contracts agree', () => {
	const entryRoute = readDrive('routes/entryCollectionOperation.js');
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
