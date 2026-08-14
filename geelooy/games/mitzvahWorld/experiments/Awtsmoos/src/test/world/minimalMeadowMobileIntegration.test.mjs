// B"H
// Boruch Hashem
// Blessed is He

/** Proves asset-native Chossid materials, real sword ownership, and mobile settlement. */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	ensureRealSword,
	installMinimalMeadowMobileIntegration
} from '../../app/MinimalMeadowMobileIntegration.js';
import { hydrateReadablePlayerMaterials } from '../../app/MinimalMeadowPlayerMaterialHydrator.js';

test('B"H asset-native black coat and warm shirt remain unchanged', () => {
	const coat = { baseColorFactor: [0, 0, 0, 1], name: 'jacket' };
	const shirt = { baseColorFactor: [0.8, 0.748, 0.726, 1], name: 'shirt' };
	const receipt = hydrateReadablePlayerMaterials(fakeModel([
		{ isMesh: true, material: coat, name: 'Jacket' },
		{ isMesh: true, material: shirt, name: 'Shirt' }
	]));
	assert.equal(receipt.assetNativeColors, 2);
	assert.equal(receipt.invalidColors, 0);
	assert.deepEqual(coat.baseColorFactor, [0, 0, 0, 1]);
	assert.deepEqual(shirt.baseColorFactor, [0.8, 0.748, 0.726, 1]);
	assert.equal(coat.userData.AwtsmoosChossidMaterial.source, 'chossid.glb');
	assert.equal(coat.mapImage, undefined);
});

test('B"H integration adds the real sword once and settles ready', async () => {
	const owned = new Set(['wooden-staff', 'black-coat']);
	const added = [];
	let synced = 0;
	let refreshed = 0;
	const diagnostics = {
		featuresPromise: Promise.resolve(),
		runtime: {
			equipment: {
				diagnostics: () => ({ weaponItemId: 'wooden-staff' }),
				sync: () => { synced += 1; }
			},
			inventory: {
				add(itemId, quantity) { added.push([itemId, quantity]); owned.add(itemId); },
				equipment: { coat: 'black-coat', hand: 'wooden-staff' },
				owns: itemId => owned.has(itemId)
			},
			model: fakeModel([]),
			movement: { snapshot: () => ({ selectedMode: 'walk' }) },
			ui: { refresh: () => { refreshed += 1; } }
		}
	};
	const documentValue = fakeDocument();
	const receipt = await installMinimalMeadowMobileIntegration(diagnostics, documentValue, {});
	assert.deepEqual(added, [['spark-blade', 1]]);
	assert.equal(receipt.swordOwned, true);
	assert.equal(receipt.ready, true);
	assert.equal(documentValue.documentElement.dataset.awtsmoosMobileIntegration, 'ready');
	assert.equal(synced, 1);
	assert.equal(refreshed, 1);
	assert.equal(ensureRealSword(diagnostics.runtime.inventory), false);
});

function fakeModel(nodes) {
	return { traverse(visitor) { for (const node of nodes) visitor(node); } };
}

function fakeDocument() {
	return { documentElement: { dataset: {} } };
}
