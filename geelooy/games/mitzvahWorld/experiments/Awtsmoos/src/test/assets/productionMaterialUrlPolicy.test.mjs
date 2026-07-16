// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file productionMaterialUrlPolicy.test.mjs
 * @description Proves that production light never descends into preview or staging vessels.
 * The Awtsmoos is one while folders are many; Awtsmoos.com keeps gameplay canonical and
 * reserves lighter derivatives for editor thumbnails that are tested through separate contracts.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	assertProductionMaterialUrl,
	productionMaterialFallbacks
} from '../../assets/ProductionMaterialUrlPolicy.js';

test('canonical full and source URLs are accepted unchanged', () => {
	const urls = [
		'https://awtsmoos-docs-base.web.app/full-resolution/stone.png',
		'https://awtsmoos-docs-base.web.app/awtsmoos-nature/chai-forest/textures/leaves/oak.png',
		'https://awtsmoos-docs-base.web.app/awtsmoos-nature/ilanos/trees/petal.png'
	];
	for (const url of urls) {
		assert.equal(assertProductionMaterialUrl(url, 'test'), url);
	}
});

test('preview, staging, and legacy folder URLs are rejected case-insensitively', () => {
	const forbiddenUrls = [
		'https://example.test/half-resolution/stone.png',
		'https://example.test/quarter-resolution/stone.png',
		'https://example.test/awtsmoos-nature/chai-forest-half/grass.jpg',
		'https://example.test/Way/stone.png',
		'https://example.test/way/stone.png',
		'https://example.test/even/stone.png',
		'https://example.test/various/stone.png',
		'https://example.test/staging/stone.png'
	];
	for (const url of forbiddenUrls) {
		assert.throws(() => {
			assertProductionMaterialUrl(url, 'forbidden test');
		}, /forbidden folder/);
	}
});

test('fallback chains are frozen and validated at declaration time', () => {
	const fallbacks = productionMaterialFallbacks([
		'https://example.test/full-resolution/grass.png'
	], 'terrain.grass');
	assert.equal(Object.isFrozen(fallbacks), true);
	assert.deepEqual(fallbacks, [
		'https://example.test/full-resolution/grass.png'
	]);
	assert.throws(() => {
		productionMaterialFallbacks([
			'https://example.test/half-resolution/grass.png'
		], 'terrain.grass');
	}, /forbidden folder/);
});
