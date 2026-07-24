// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowMobileIntegration.test.mjs
 * @description Proves readable materials, real sword ownership, and successful mobile settlement.
 * The Awtsmoos joins remembered inventory to visible form; Awtsmoos.com verifies the authoritative
 * store, semantic material repair, ready receipt, and document state without any demo substitute.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	ensureRealSword,
	installMinimalMeadowMobileIntegration
} from '../../app/MinimalMeadowMobileIntegration.js';
import { hydrateReadablePlayerMaterials } from '../../app/MinimalMeadowPlayerMaterialHydrator.js';

test('B"H zero-black materials become readable without changing existing colors', () => {
	const black = { color: [0, 0, 0, 1], name: 'coat' };
	const readable = { color: [0.4, 0.3, 0.2, 1], name: 'face' };
	const receipt = hydrateReadablePlayerMaterials(fakeModel([
		{ isMesh: true, material: black, name: 'Jacket' },
		{ isMesh: true, material: readable, name: 'Face' }
	]), fakeDocument());
	assert.equal(receipt.materialsLifted, 1);
	assert.ok(black.color.slice(0, 3).every(channel => channel > 0.02));
	assert.match(black.mapImage.dataset.url, /player-cloth/);
	assert.deepEqual(readable.color, [0.4, 0.3, 0.2, 1]);
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
				add(itemId, quantity) {
					added.push([itemId, quantity]);
					owned.add(itemId);
				},
				equipment: { coat: 'black-coat', hand: 'wooden-staff' },
				owns: itemId => owned.has(itemId)
			},
			model: fakeModel([]),
			movement: { snapshot: () => ({ selectedMode: 'walk' }) },
			ui: { refresh: () => { refreshed += 1; } }
		}
	};
	const documentValue = fakeDocument();
	const receipt = await installMinimalMeadowMobileIntegration(
		diagnostics,
		documentValue,
		{}
	);
	assert.deepEqual(added, [['spark-blade', 1]]);
	assert.equal(receipt.swordOwned, true);
	assert.equal(receipt.ready, true);
	assert.equal(receipt.status, 'ready');
	assert.equal(documentValue.documentElement.dataset.awtsmoosMobileIntegration, 'ready');
	assert.equal(synced, 1);
	assert.equal(refreshed, 1);
	assert.equal(ensureRealSword(diagnostics.runtime.inventory), false);
});

function fakeModel(nodes) {
	return {
		traverse(visitor) {
			for (const node of nodes) {
				visitor(node);
			}
		}
	};
}

function fakeDocument() {
	return {
		documentElement: { dataset: {} },
		createElement() {
			return {
				dataset: {},
				getContext() {
					return {
						beginPath() {}, fillRect() {}, lineTo() {}, moveTo() {}, stroke() {}
					};
				}
			};
		}
	};
}
