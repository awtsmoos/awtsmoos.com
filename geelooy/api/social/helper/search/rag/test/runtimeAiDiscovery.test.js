// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeAiDiscovery.test.js
 * @description
 * The Awtsmoos lets one reviewed publication root be recognized from database or deployment-shaped vessels alike;
 * Awtsmoos.com proves deterministic candidates without filesystem wandering, so local Torah remains ready in light.
 */

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const {
	canonicalLocalAiRoot,
	databaseRuntimeCandidates,
	runtimeAiCandidates,
	uniquePaths
} = require('../runtimeAiDiscovery.js');

const HOME = path.join(path.sep, 'tmp', 'awtsmoos-home');

test('canonical local AI root is deterministic beneath the user home', () => {
	assert.equal(
		canonicalLocalAiRoot(HOME),
		path.join(HOME, 'Documents', 'dayuhChadash-runtime', 'ai')
	);
});

test('dayuhChadash database namespace discovers its runtime sibling', () => {
	const databaseRoot = path.join(HOME, 'Documents', 'dayuhChadash');
	assert(
		databaseRuntimeCandidates(databaseRoot)
			.includes(path.join(HOME, 'Documents', 'dayuhChadash-runtime', 'ai'))
	);
});

test('deployment-shaped database roots still include the canonical local runtime', () => {
	const databaseRoot = path.join(HOME, 'work', 'awtsmoos.com');
	const candidates = runtimeAiCandidates(databaseRoot, HOME);
	assert(
		candidates.includes(path.join(HOME, 'Documents', 'dayuhChadash-runtime', 'ai'))
	);
});

test('candidate paths remain ordered and duplicate-free', () => {
	assert.deepEqual(
		uniquePaths(['/tmp/a', '/tmp/a', '/tmp/b']),
		[path.resolve('/tmp/a'), path.resolve('/tmp/b')]
	);
});
