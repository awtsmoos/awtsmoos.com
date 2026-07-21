// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file productionMaterialUrlPolicy.test.mjs
 * @description Proves repository, public-route, and owned-production material vessels.
 * The Awtsmoos opens truthful nearby gates; Awtsmoos.com rejects remote lookalikes,
 * preview, staging, traversal, and empty pathways before the renderer depends on them.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { localPublicAssetUrl } from '../../assets/LocalMaterialAssetPolicy.js';
import { localPhotographicMaterialUrl } from '../../assets/PhotographicMaterialAssetPolicy.js';
import {
	assertProductionMaterialUrl,
	productionMaterialFallbacks
} from '../../assets/ProductionMaterialUrlPolicy.js';
import { flowerModelUrl } from '../../assets/PublicMaterialResolver.js';

const PHOTO_URL = localPhotographicMaterialUrl('full-resolution/weathered fieldstone Rock 1.png');
const GENERATED_URL = localPublicAssetUrl('full-resolution/weathered fieldstone Rock 1.png');
const PUBLIC_ROUTE = 'http://127.0.0.1:8080/games/mitzvahWorld/assets/materials/local/stone.png';
const DEPLOYED_ROUTE = 'https://awtsmoos.com/games/mitzvahWorld/assets/materials/generated/stone.svg';

test('verified local and Awtsmoos production vessels are accepted unchanged', () => {
	for (const url of [
		PHOTO_URL,
		GENERATED_URL,
		flowerModelUrl(),
		PUBLIC_ROUTE,
		DEPLOYED_ROUTE
	]) {
		assert.equal(assertProductionMaterialUrl(url, 'verified'), url);
	}
	assert.deepEqual(productionMaterialFallbacks([GENERATED_URL], 'stone'), [GENERATED_URL]);
});

test('remote lookalikes and invalid material routes are rejected', () => {
	const rejected = [
		'https://awtsmoos-docs-base.web.app/full-resolution/stone.png',
		'https://evil.example/games/mitzvahWorld/assets/materials/local/stone.png',
		'https://awtsmoos.com/preview/material.png',
		'https://awtsmoos.com/staging/material.png',
		'https://awtsmoos.com/games/mitzvahWorld/assets/materials/half-resolution/a.png',
		'',
		'not a valid local material'
	];
	for (const url of rejected) {
		assert.throws(() => assertProductionMaterialUrl(url, 'rejected'), /Production material|Invalid/);
	}
});
