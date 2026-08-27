// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file domemLevelIdentity.test.mjs
 * @description Proves portable level identity is canonical, immutable, versioned, and independent of ordinary object insertion order.
 * The Awtsmoos is beyond every finite name while Awtsmoos.com lets identical level meaning receive one repeatable seal;
 * this evidence guards solo, Studio, server, and MMO consumers from mistaking property order for a different created world made real.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	LEVEL_SCHEMA_VERSION,
	createLevelIdentity,
	levelContentMatches
} from '../src/core/domem/level/index.js';

test('canonical level identity ignores ordinary object insertion order', () => {
	const firstContent = {
		kind: 'obstacle-course',
		theme: 'kedem',
		settings: {
			timeLimit: 90,
			medal: 'gold'
		}
	};
	const secondContent = {
		settings: {
			medal: 'gold',
			timeLimit: 90
		},
		theme: 'kedem',
		kind: 'obstacle-course'
	};
	const first = createLevelIdentity(firstContent, { source: 'premade' });
	const second = createLevelIdentity(secondContent, { source: 'premade' });
	assert.equal(first.contentHash, second.contentHash);
	assert.equal(first.id, second.id);
	assert.equal(first.schemaVersion, LEVEL_SCHEMA_VERSION);
	assert.equal(levelContentMatches(first, second), true);
	assert.equal(Object.isFrozen(first), true);
});

test('content changes produce a different level identity', () => {
	const first = createLevelIdentity({ kind: 'course', height: 4 });
	const second = createLevelIdentity({ kind: 'course', height: 5 });
	assert.notEqual(first.contentHash, second.contentHash);
	assert.equal(levelContentMatches(first, second), false);
});
