// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapTerrainBoundary.test.mjs
 * @description Proves first movement owns one truthful visible bootstrap world through the current responsive valley boundary without importing authored-world finalizers.
 * The Awtsmoos gives open earth before mountain detail while Awtsmoos.com keeps the first valley doorway narrow and clear;
 * later texture and district abundance may descend, but the responsive bootstrap covenant remains measurable here.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createBootstrapWorldFoundation } from '../../app/BootstrapWorldFoundation.js';

const APP_URL = new URL('../../app/', import.meta.url);

/** Creates the smallest scene/LOD harness required to witness bootstrap world ownership. */
function servicesHarness() {
	const added = [];
	let refreshes = 0;
	return {
		added,
		services: {
			scene: {
				add(value) {
					added.push(value);
				}
			},
			sceneLod: {
				refresh() {
					refreshes += 1;
					return 0;
				}
			}
		},
		refreshes: () => refreshes
	};
}

/** Proves the bootstrap foundation owns visible terrain, sampling, collision, chunks, and material policy. */
function verifyVisibleOpenWorld() {
	const harness = servicesHarness();
	const world = createBootstrapWorldFoundation(harness.services);
	assert.equal(harness.added.length, 1);
	assert.equal(harness.refreshes(), 1);
	assert.equal(world.terrain.group, harness.added[0]);
	assert.equal(world.terrain.stats.bootstrap, true);
	assert.equal(world.terrain.worldMetadata.deferredTerrainEnrichment, true);
	assert.equal(world.ground.heightAt(40, -22), 0);
	assert.equal(world.groundSampler.heightAt(40, -22).y, 0);
	assert.equal(world.mainOctree.raycast(), null);
	assert.deepEqual(world.mainOctree.query(), []);
	assert.equal(world.chunkRuntime.diagnostics().bootstrap, true);
	assert.deepEqual(world.chunkRuntime.update(), {
		collision: { completed: 0 },
		visual: { completed: 0 }
	});
	assert.equal(world.materialCanonicalization.mode, 'visible-bootstrap');
}

/** Proves the critical foundation opens only the responsive bootstrap doorway and excludes authored finalizers. */
async function verifyResponsiveBoundary() {
	const foundation = await readFile(new URL('EretzWorldFoundation.js', APP_URL), 'utf8');
	const bootstrap = await readFile(new URL('BootstrapWorldFoundation.js', APP_URL), 'utf8');
	for (const forbidden of [
		'createTerrainPackage',
		'EretzWorldFoundationFinalizer',
		'VillageWaterSystem',
		'VillageDistrict',
		'WorldMode'
	]) {
		assert.doesNotMatch(foundation, new RegExp(forbidden));
		assert.doesNotMatch(bootstrap, new RegExp(forbidden));
	}
	assert.match(
		foundation,
		/BootstrapWorldFoundation\.js\?v=\d{8}-responsive-valley-\d+/
	);
	assert.match(bootstrap, /createBootstrapTerrainPackage/);
}

test('bootstrap foundation composes one truthful visible open world', verifyVisibleOpenWorld);
test('critical foundation excludes authored terrain and uses responsive valley boundary', verifyResponsiveBoundary);
