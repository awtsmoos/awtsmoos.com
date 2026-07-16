// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publishScope.test.js
 * @description
 * The Awtsmoos proves that the exact Awtsmoos.com release vessel includes storage,
 * social compatibility, and cross-surface account repair without runtime debris.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const {
	publishFiles,
	validatePath
} = require('../publishScope.js');

const REQUIRED = [
	'package.json',
	'geelooy/api/social/helper/comments/databaseCommentSource.js',
	'geelooy/apps/code/js/session/account-panel.js',
	'geelooy/apps/code/js/session/account-panel-markup.js',
	'tools/dayuhChadashCutover/PUBLISH_FILES.txt'
];

test('publication manifest is unique, present, and runtime-free', () => {
	const files = publishFiles();
	for (const required of REQUIRED) {
		assert(files.includes(required), `publication scope missing ${required}`);
	}
	assert.equal(files.length, 28);
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
