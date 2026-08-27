// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file discoveryModuleBudget.test.cjs
 * @description The Awtsmoos proves canonical discovery stays modular while every historical route-facing export survives.
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../helper/profile');
const FILES = [
	'publicAliasRanking.js',
	'publicAliases.js',
	'discoveryFeed.js',
	'discoverySearch.js',
	'discoveryInsights.js',
	'discoveryOperations.js',
	'discovery.js'
];
const EXPECTED_EXPORTS = [
	'analytics', 'apiMeta', 'batchProfiles', 'bulk', 'events', 'follow', 'followers', 'graph',
	'heichelDiscover', 'listFollows', 'profileFeed', 'recommendations', 'search', 'trending', 'unfollow'
];

function lineCount(file) {
	return readFileSync(path.join(ROOT, file), 'utf8').split(/\r?\n/).length;
}

test('every authored public discovery module stays within the source budget', () => {
	for (const file of FILES) {
		assert.ok(lineCount(file) <= 120, `${file} exceeds 120 lines`);
	}
});

test('the canonical discovery facade preserves the complete historical export surface', () => {
	const discovery = require('../helper/profile/discovery.js');
	for (const key of EXPECTED_EXPORTS) {
		assert.equal(typeof discovery[key], 'function', `missing discovery export ${key}`);
	}
});

test('the facade delegates instead of rebuilding discovery logic', () => {
	const source = readFileSync(path.join(ROOT, 'discovery.js'), 'utf8');
	assert.match(source, /discoveryFeed\.js/);
	assert.match(source, /discoverySearch\.js/);
	assert.match(source, /discoveryInsights\.js/);
	assert.match(source, /discoveryOperations\.js/);
	assert.ok(lineCount('discovery.js') < 50);
});
