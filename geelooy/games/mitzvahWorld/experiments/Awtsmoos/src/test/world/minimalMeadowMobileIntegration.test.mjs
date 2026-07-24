// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowMobileIntegration.test.mjs
 * @description Proves zero-black lifting, real sword ownership, and final mobile wiring.
 * The Awtsmoos joins remembered inventory to visible form; Awtsmoos.com verifies the real store
 * contract, semantic material repair, safe-area stylesheet, and post-feature module without a demo.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
	ensureRealSword,
	installMinimalMeadowMobileIntegration
} from '../../app/MinimalMeadowMobileIntegration.js';
import { hydrateReadablePlayerMaterials } from '../../app/MinimalMeadowPlayerMaterialHydrator.js';

const gameRoot = 'geelooy/games/mitzvahWorld';

test('zero-black player materials become readable while existing colors remain unchanged', () => {
	const black = { color: [0, 0, 0, 1], name: 'coat' };
	const readable = { color: [0.4, 0.3, 0.2, 1], name: 'face' };
	const model = fakeModel([
		{ isMesh: true, material: black, name: 'Jacket' },
		{ isMesh: true, material: readable, name: 'Face' }
	]);
	const receipt = hydrateReadablePlayerMaterials(model, fakeDocument());
	assert.equal(receipt.materialsLifted, 1);
	assert.ok(black.color.slice(0, 3).every(channel => channel > 0.02));
	assert.match(black.mapImage.dataset.url, /player-cloth/);
	assert.deepEqual(readable.color, [0.4, 0.3, 0.2, 1]);
});

test('integration adds the real sword once and refreshes authoritative equipment', async () => {
	const owned = new Set(['wooden-staff', 'black-coat']);
	const added = [];
	const diagnostics = {
		featuresPromise: Promise.resolve(),
		runtime: {
			equipment: { diagnostics: () => ({ weaponItemId: 'wooden-staff' }), sync() {} },
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
			ui: { refresh() {} }
		}
	};
	const receipt = await installMinimalMeadowMobileIntegration(diagnostics, fakeDocument());
	assert.deepEqual(added, [['spark-blade', 1]]);
	assert.equal(receipt.swordOwned, true);
	assert.equal(ensureRealSword(diagnostics.runtime.inventory), false);
});

test('index loads the bounded tree facade and final mobile integration last', () => {
	const index = fs.readFileSync(`${gameRoot}/index.html`, 'utf8');
	assert.match(index, /MinimalMeadowTreeCoreFacade\.js/);
	assert.match(index, /mitzvah-world-mobile-integration\.css/);
	assert.match(index, /MinimalMeadowMobileIntegration\.js/);
	assert.ok(index.indexOf('mitzvah-world-mobile-integration.css') > index.indexOf('mitzvah-world-houses.css'));
});

function fakeModel(nodes) {
	return {
		traverse(visitor) {
			for (const node of nodes) visitor(node);
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
