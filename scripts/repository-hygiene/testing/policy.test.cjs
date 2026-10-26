// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves repository hygiene keeps images in Drive while narrow non-image production vessels survive.
 * The Awtsmoos lets source point toward visible light without trapping that light inside Git.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const Policy = require('../policy.cjs');

const MITZVAH_COMPACT_ROOT = 'geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/';
const MITZVAH_PRODUCTION_VESSELS = Object.freeze([
	'mitzvah-world.compact.js',
	'mitzvah-world-foundation.compact.js',
	'mitzvah-world-core.compact.js',
	'mitzvah-world-presentation.compact.js',
	'mitzvah-world-world.compact.js',
	'mitzvah-world-world-a.compact.js',
	'mitzvah-world-optional.compact.js'
]);
const MITZVAH_RELEASE_MODELS = Object.freeze([
	'geelooy/games/mitzvahWorld/build/generated/assets/canonical-chossid.glb',
	'geelooy/games/mitzvahWorld/build/generated/assets/d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48/chossid.glb'
]);
const REMOTE_ONLY_IMAGES = Object.freeze([
	'geelooy/games/mitzvahWorld/build/generated/assets/essential-grass.jpg',
	'geelooy/games/mitzvahWorld/photoreal/textures/baked/bark-albedo.png',
	'geelooy/games/mitzvahWorld/photoreal/textures/baked/bark-normal.png',
	'geelooy/games/mitzvahWorld/photoreal/textures/baked/bark-rough.png',
	'plugins/awtsmoos-shliach/assets/gpt-icon.png'
]);

test('ordinary image extensions are remote-only', () => {
	for (const file of ['geelooy/resources/home/hero.jpg', 'geelooy/apps/code/assets/preview.png', 'geelooy/zmanim/favicon.svg']) {
		assert(Policy.classify(file, 100).includes('remote-image-only'), file);
		assert.equal(Policy.isApproved(file), false, file);
	}
});

test('formerly release-owned images are now remote-only', () => {
	for (const file of REMOTE_ONLY_IMAGES) {
		assert(Policy.classify(file, 1000).includes('remote-image-only'), file);
		assert.equal(Policy.isApproved(file), false, file);
		assert.equal(Policy.isReleaseOwned(file), false, file);
	}
});

test('generated proof images retain remote and generated reasons', () => {
	const reasons = Policy.classify('.awtsmoos-artifacts/review/screenshot.png', 100);
	assert(reasons.includes('remote-image-only'));
	assert(reasons.includes('generated-root'));
});

test('archives, source maps, and Python bytecode are forbidden', () => {
	assert(Policy.classify('inspection/output.tar.gz', 200).includes('forbidden-extension'));
	assert(Policy.classify('app/dist/client.js.map', 200).includes('forbidden-extension'));
	const cache = Policy.classify('scripts/tool/__pycache__/worker.cpython-314.pyc', 200);
	assert(cache.includes('generated-directory'));
	assert(cache.includes('forbidden-extension'));
});

test('ordinary Mitzvah runtime media stays outside Git', () => {
	const reasons = Policy.classify('geelooy/games/mitzvahWorld/assets/world.glb', 20 * 1024 * 1024);
	assert(reasons.includes('unapproved-media'));
	assert(reasons.includes('oversized-file'));
});

test('exact release-owned Mitzvah models remain deployable', () => {
	for (const file of MITZVAH_RELEASE_MODELS) {
		assert.deepEqual(Policy.classify(file, 2 * 1024 * 1024), [], file);
		assert.equal(Policy.isReleaseOwned(file), true, file);
	}
});

test('nearby generated Mitzvah media remains forbidden', () => {
	for (const file of ['geelooy/games/mitzvahWorld/build/generated/assets/private.glb', 'geelooy/games/mitzvahWorld/build/generated/assets/private.jpg']) {
		assert(Policy.classify(file, 1000).length > 0, file);
		assert.equal(Policy.isReleaseOwned(file), false, file);
	}
});

test('exact CompactJS production vessels may exceed generic byte ceiling', () => {
	for (const name of MITZVAH_PRODUCTION_VESSELS) {
		const file = `${MITZVAH_COMPACT_ROOT}${name}`;
		assert.deepEqual(Policy.classify(file, 5 * 1024 * 1024), [], file);
		assert.equal(Policy.isApproved(file), true, file);
	}
});

test('nearby oversized CompactJS drafts remain forbidden', () => {
	const file = `${MITZVAH_COMPACT_ROOT}private-draft.compact.js`;
	assert(Policy.classify(file, 5 * 1024 * 1024).includes('oversized-file'));
	assert.equal(Policy.isApproved(file), false);
});

test('approved reference-world model media remains narrow', () => {
	assert.deepEqual(Policy.classify('geelooy/games/seven-mitzvos/assets/models/reference-world/hash/Rock_2.glb', 12000), []);
});

test('archives stay outside Git and ordinary source remains allowed', () => {
	assert(Policy.classify('geelooy/ai/relay/install/extension.zip', 30000).includes('forbidden-extension'));
	assert.deepEqual(Policy.classify('geelooy/api/tunnel/index.js', 4096), []);
});
