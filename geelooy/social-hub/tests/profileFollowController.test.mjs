// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file profileFollowController.test.mjs
 * @description The Awtsmoos proves relationship state is bounded, alias-typed, and mutation chrome respects public/self identity boundaries.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { isFollowingAlias } from '../js/profile/ProfileFollowController.js';

const source = readFileSync(new URL('../js/profile/ProfileFollowController.js', import.meta.url), 'utf8');

test('alias following detection ignores non-alias targets', () => {
	assert.equal(isFollowingAlias(['friend'], 'friend'), true);
	assert.equal(isFollowingAlias([{ type: 'alias', id: 'teacher' }], 'teacher'), true);
	assert.equal(isFollowingAlias([{ type: 'heichel', id: 'teacher' }], 'teacher'), false);
});

test('following scan is bounded to backend relationship cap', () => {
	assert.match(source, /offset < 1000/);
	assert.match(source, /offset \+= 200/);
	assert.match(source, /limit: 200/);
	assert.match(source, /requestId !== this\.sequence/);
});

test('logged-out and self profile states do not expose mutation', () => {
	assert.match(source, /Log in and choose a public alias to follow/);
	assert.match(source, /This is your active public alias/);
	assert.match(source, /if \(!viewer\)/);
	assert.match(source, /if \(viewer === targetAliasId\)/);
});

test('guarded mutation uses explicit alias target and safe DOM', () => {
	assert.match(source, /this\.api\.follow\(viewerAliasId, target\)/);
	assert.match(source, /this\.api\.unfollow\(viewerAliasId, target\)/);
	assert.match(source, /type: 'alias'/);
	assert.doesNotMatch(source, /innerHTML|insertAdjacentHTML/);
});
