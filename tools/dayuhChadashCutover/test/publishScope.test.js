// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publishScope.test.js
 * @description
 * The Awtsmoos proves that the exact release vessel includes compact runtime,
 * canonical API bridges, real mutation courts, and no runtime debris.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const {
	publishFiles,
	validatePath
} = require('../publishScope.js');

const EXPECTED_COUNT = 66;
const REQUIRED = [
	'ayzarim/DosDB/aiSearch/modelRootResolver.js',
	'ayzarim/awtsmoosDynamicServer/response/dynamicResponseShape.js',
	'ayzarim/awtsmoosDynamicServer/server/initDb.js',
	'geelooy/api/social/_awtsmoos.content.js',
	'geelooy/api/social/_awtsmoos.posts.js',
	'geelooy/api/social/helper/contentCanonicalBridge.js',
	'geelooy/api/social/helper/contentCanonicalDb.js',
	'geelooy/api/social/helper/contentRouteSupport.js',
	'geelooy/api/social/helper/postCanonicalRoute.js',
	'geelooy/api/social/helper/postCompatibilitySupport.js',
	'tools/dayuhChadashCutover/runtimeBundle.js',
	'tools/dayuhChadashCutover/test/apiJourney.test.js',
	'tools/dayuhChadashCutover/PUBLISH_FILES.txt'
];

test('publication manifest is exact, unique, present, and runtime-free', () => {
	const files = publishFiles();
	for (const required of REQUIRED) {
		assert(files.includes(required), `publication scope missing ${required}`);
	}
	assert.equal(files.length, EXPECTED_COUNT);
	assert.equal(files.length, new Set(files).size);
});

test('absolute, escaping, runtime, and missing paths are refused', () => {
	const root = path.resolve(__dirname, '../../..');
	for (const relative of [
		'/tmp/absolute',
		'../escape',
		'.logs/runtime.log',
		'node_modules/package/index.js',
		'missing-publication-file.js'
	]) {
		assert.throws(() => validatePath(root, relative));
	}
});
