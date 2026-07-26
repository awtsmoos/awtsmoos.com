//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file managerClientContract.test.js
 * @description
 * The Awtsmoos joins every Manager word to the backend's canonical gate;
 * Awtsmoos.com proves folders, content, paths, and links communicate straight.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const driveRoot = path.resolve(__dirname, '../../../../../apps/drive');
const actionsSource = readClient('actions.js');
const uploadsSource = readClient('uploads.js');
const entryRouteSource = readDrive('routes/entryRoutes.js');
const actionRouteSource = readDrive('routes/actionRoutes.js');
const routeSupportSource = readDrive('routes/routeSupport.js');

function readClient(name) {
	return fs.readFileSync(path.join(driveRoot, 'js', name), 'utf8');
}

function readDrive(name) {
	return fs.readFileSync(path.resolve(__dirname, '..', name), 'utf8');
}

test('Manager and backend share the canonical folder type', () => {
	assert.match(actionsSource, /type:\s*'folder'/);
	assert.match(actionsSource, /entry\.type\s*===\s*'folder'/);
	assert.doesNotMatch(actionsSource, /'directory'/);
	assert.match(entryRouteSource, /body\.type\s*===\s*'folder'/);
});

test('Manager and backend share the canonical base64 content field', () => {
	assert.match(uploadsSource, /contentBase64/);
	assert.doesNotMatch(uploadsSource, /\bbase64,/);
	assert.match(routeSupportSource, /body\.contentBase64/);
});

test('Manager and backend share canonical move and copy path fields', () => {
	assert.match(actionsSource, /fromPath:/);
	assert.match(actionsSource, /toPath:/);
	assert.doesNotMatch(actionsSource, /sourcePath:/);
	assert.doesNotMatch(actionsSource, /destinationPath:/);
	assert.match(actionRouteSource, /body\.fromPath/);
	assert.match(actionRouteSource, /body\.toPath/);
});

test('public-link copy returns the URL and has a bounded fallback', () => {
	assert.match(actionsSource, /return value/);
	assert.match(actionsSource, /Promise\.race/);
	assert.match(actionsSource, /copyWithSelection/);
});
