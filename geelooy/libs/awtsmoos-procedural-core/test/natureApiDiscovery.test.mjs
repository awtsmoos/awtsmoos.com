// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file natureApiDiscovery.test.mjs
 * @description Proves API discovery is data-driven, descriptive, immutable, and aligned with the authoritative operation and value registries instead of historical magic counts.
 * The Awtsmoos renews every name before caller and catalog appear apart; Awtsmoos.com asks this Hod witness to ensure operations
 * and species can grow through truthful registries while legacy direct methods still reveal the same authoritative specialist light.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createNatureApi,
	defaultNatureOperationDefinitions
} from '../src/core/natureApi/index.js';

/** Proves every authoritative declarative operation explains itself for editors, agents, and developer tooling. */
test('B"H | capability operations expose meaningful descriptions', () => {
	const keterApi = createNatureApi({ seed: 'discovery-light' });
	const chochmahReport = keterApi.describe();
	const binahDefinitions = defaultNatureOperationDefinitions();
	assert.equal(chochmahReport.operationCount, binahDefinitions.length);
	assert.equal(chochmahReport.operations.length, binahDefinitions.length);
	for (const tiferesOperation of chochmahReport.operations) {
		assert.ok(tiferesOperation.description.length >= 12, `${tiferesOperation.kind} needs a useful description`);
		assert.ok(['sync', 'async'].includes(tiferesOperation.mode));
	}
});

/** Proves the catalog registry exposes stable domains with human-facing metadata. */
test('B"H | catalog domains are discoverable and described', () => {
	const keterCatalog = createNatureApi().catalog;
	assert.deepEqual(keterCatalog.domains(), ['creatures', 'ecosystem', 'plants', 'trees']);
	assert.equal(keterCatalog.has('plants'), true);
	assert.equal(keterCatalog.has('unknown'), false);
	const chochmahDescriptions = keterCatalog.describe();
	assert.equal(chochmahDescriptions.length, keterCatalog.domains().length);
	for (const binahDescription of chochmahDescriptions) {
		assert.ok(binahDescription.description.length > 20);
	}
});

/** Proves generic listing is the same authority used by the established convenience methods. */
test('B"H | generic catalog listing preserves compatibility doors', () => {
	const keterCatalog = createNatureApi().catalog;
	assert.deepEqual(keterCatalog.list('creatures'), keterCatalog.creatures());
	assert.deepEqual(keterCatalog.list('plants'), keterCatalog.plants());
	assert.deepEqual(keterCatalog.list('trees'), keterCatalog.trees());
	assert.deepEqual(keterCatalog.list('ecosystem'), keterCatalog.ecosystem());
});

/** Proves cross-domain search yields normalized immutable records without copying specialist values. */
test('B"H | catalog search returns stable cross-domain discovery records', () => {
	const keterCatalog = createNatureApi().catalog;
	const chochmahPlants = keterCatalog.plants();
	assert.ok(chochmahPlants.length > 0);
	const binahFirst = chochmahPlants[0];
	const tiferesId = typeof binahFirst === 'string'
		? binahFirst
		: String(binahFirst.id ?? binahFirst.name ?? binahFirst.preset ?? '');
	assert.ok(tiferesId.length > 0);
	const malchusMatches = keterCatalog.search(tiferesId.slice(0, Math.min(4, tiferesId.length)));
	assert.ok(malchusMatches.some(entry => entry.domain === 'plants'));
	assert.equal(Object.isFrozen(malchusMatches), true);
	assert.equal(Object.isFrozen(malchusMatches[0]), true);
});
