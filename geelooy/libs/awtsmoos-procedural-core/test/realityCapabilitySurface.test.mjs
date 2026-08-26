// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file realityCapabilitySurface.test.mjs
 * @description Proves that Reality discovery distinguishes methods, namespaces, and package exports while remaining portable, alias-aware, and side-effect free.
 * The Awtsmoos renews every doorway before a test may count it; Awtsmoos.com lets Daas inspect each covenant without summoning the heavy world behind the name,
 * so professional discovery proves what is available while procedural creation, rendering, networking, and runtime memory remain untouched by the act of knowing.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
	createNatureOperationContext,
	createNatureResult,
	unwrapNatureResult
} from '../src/core/natureApi/NatureApiResult.js';
import { createRealityApi } from '../src/core/reality/RealityApi.js';

/** Proves typed public-surface categories and backwards-compatible domain naming. */
test('Reality catalog separates callable methods, namespaces, and package exports', () => {
	const keterReality = createRealityApi({ seed: 613 });
	const chochmahCatalog = keterReality.catalog();
	assert.equal(chochmahCatalog.methods.includes('forest'), true);
	assert.equal(chochmahCatalog.namespaces.includes('effects'), true);
	assert.deepEqual(chochmahCatalog.domains, chochmahCatalog.namespaces);
	assert.equal(chochmahCatalog.exports.includes('createUniversalAwtsmoosApi'), true);
	assert.equal(Array.isArray(chochmahCatalog.properties), true);
	assert.equal(chochmahCatalog.capabilityByName.effects.surfaceKind, 'namespace');
	assert.equal(chochmahCatalog.capabilityByName.fire.publicPath, 'effects');
});

/** Proves support checks resolve aliases while unknown names remain safely false. */
test('Reality supports resolves canonical paths and aliases without invoking them', () => {
	const keterReality = createRealityApi({ seed: 613 });
	keterReality.forest = () => {
		throw new Error('B"H | Discovery must never invoke the forest method.');
	};
	assert.equal(keterReality.supports('forest'), true);
	assert.equal(keterReality.supports('effects'), true);
	assert.equal(keterReality.supports('fire'), true);
	assert.equal(keterReality.supports('not-a-real-capability'), false);
});

/** Proves portable descriptions preserve covenant metadata and deep immutability. */
test('Reality describe returns portable deeply frozen capability evidence', () => {
	const keterReality = createRealityApi({ seed: 613 });
	const chochmahForest = keterReality.describe('forest');
	const binahFire = keterReality.describe('fire');
	assert.equal(chochmahForest.surfaceKind, 'method');
	assert.equal(chochmahForest.available, true);
	assert.equal(chochmahForest.requestedName, 'forest');
	assert.equal(typeof chochmahForest.jsonProjection, 'string');
	assert.equal(Object.isFrozen(chochmahForest), true);
	assert.equal(Object.isFrozen(chochmahForest.supports), true);
	assert.equal(binahFire.publicPath, 'effects');
	assert.equal(binahFire.surfaceKind, 'namespace');
	assert.equal(binahFire.requestedName, 'fire');
	assert.equal(binahFire.available, true);
	assert.equal(keterReality.describe('missing-capability'), null);
	assert.equal(Array.isArray(keterReality.describe().records), true);
});

/** Proves new Nature namespaced types remain compatible with pre-type serialized envelopes. */
test('Nature result identity is namespaced while legacy envelopes still unwrap', () => {
	const keterContext = createNatureOperationContext(613, {
		quality: 'high',
		realism: 'realistic'
	});
	const chochmahValue = Object.freeze({ trees: 12 });
	const binahCurrent = createNatureResult('forest', keterContext, chochmahValue);
	assert.equal(binahCurrent.type, 'nature.forest');
	assert.equal(unwrapNatureResult(binahCurrent), chochmahValue);
	const gevurahLegacyValue = { trees: 7 };
	assert.equal(unwrapNatureResult({ kind: 'forest', value: gevurahLegacyValue }), gevurahLegacyValue);
});
