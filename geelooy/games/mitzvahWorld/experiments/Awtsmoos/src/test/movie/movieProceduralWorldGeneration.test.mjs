// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProceduralWorldGeneration.test.mjs
 * @description Proves structured JSON worlds compile deterministically and drive real MinimalMeadow stage contracts.
 * The Awtsmoos is beyond seed and region while each finite generated world must return the selfsame receipt;
 * Awtsmoos.com verifies JSON intent, real texture discovery, progress, atmosphere, and runtime evidence remain complete.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieMitzvahWorldStages } from '../../movie/MovieMitzvahWorldStages.js';
import { createMovieProceduralRandom } from '../../movie/MovieProceduralSeed.js';
import { movieRemoteTextureCatalog } from '../../movie/MovieRemoteTextureCatalog.js';
import { loadMovieWorld } from '../../movie/MovieWorldLoader.js';
import { compileMovieWorldJson } from '../../movie/MovieWorldJsonCompiler.js';
import { isMovieWorldSpec } from '../../movie/MovieWorldSpec.js';

test('seeded random and structured world JSON compilation are deterministic', () => {
	const left = createMovieProceduralRandom(613, 'village');
	const right = createMovieProceduralRandom(613, 'village');
	assert.deepEqual(
		[left.number(), left.integer(1, 10), left.pick(['a', 'b', 'c'])],
		[right.number(), right.integer(1, 10), right.pick(['a', 'b', 'c'])]
	);
	const source = {
		camera: { preferredRigs: ['water-following'], shotScale: 'portrait-medium' },
		hydrology: { focus: 'connected-river-garden' },
		regionId: 'river-garden',
		seed: 77,
		vegetation: { ecology: 'riparian-garden' }
	};
	const first = compileMovieWorldJson(source);
	const second = compileMovieWorldJson(source);
	assert.deepEqual(first, second);
	assert.equal(isMovieWorldSpec(first), true);
	assert.equal(first.regionId, 'river-garden');
	assert.equal(first.hydrology.focus, 'connected-river-garden');
	assert.equal(first.vegetation.ecology, 'riparian-garden');
	assert.deepEqual(first.camera.preferredRigs, ['water-following']);
	assert.doesNotThrow(() => JSON.stringify(first));
	assert.throws(
		() => compileMovieWorldJson('A family crosses the river at golden hour.'),
		/structured JSON object input/
	);
});

test('remote texture catalog exposes the production shared-world server', () => {
	const catalog = movieRemoteTextureCatalog();
	assert.equal(catalog.root, 'https://awtsmoos.com/sites/firebase_drive_migration/');
	assert.equal(catalog.total, 125);
	assert.ok(catalog.families.ground.length > 20);
	assert.ok(catalog.families.architecture.length > 20);
	assert.ok(catalog.families.trees.length > 20);
	assert.ok(catalog.families.craft.some(entry => /water/i.test(entry.filename)));
});

test('structured world stages drive package, region, rich-world, and atmosphere receipts', async () => {
	const calls = [];
	const runtime = {
		bus: { emit: (name, payload) => calls.push([name, payload]) },
		featuresPromise: Promise.resolve({ essentialReady: true }),
		model: { position: { set: (...values) => calls.push(['position', values]) } },
		movementRecovery: { checkpoint: value => calls.push(['checkpoint', value.x]) },
		optionalFeaturePromise: Promise.resolve({ optionalReady: true }),
		regionPackages: {
			diagnostics: () => ({ activeId: 'lower-meadow' }),
			transition: async id => ({ activeId: id, loads: 1 })
		},
		regions: {
			snapshot: () => ({ currentRegionId: 'river-garden' }),
			update: force => calls.push(['region-update', force])
		},
		richWorldPromise: Promise.resolve({ richWorldReady: true }),
		state: {},
		terrain: { heightAt: () => 4 },
		worldMode: 'minimal-meadow'
	};
	const world = compileMovieWorldJson({
		hydrology: { focus: 'connected-river-garden' },
		regionId: 'river-garden',
		seed: 8
	});
	const progress = [];
	const result = await loadMovieWorld({
		onProgress: state => progress.push(state.progress),
		stages: createMovieMitzvahWorldStages(runtime, world, { sceneId: 'opening' })
	});
	assert.equal(result.status, 'ready');
	assert.equal(result.progress, 1);
	assert.equal(runtime.movieWorldSpec.id, world.id);
	assert.match(runtime.worldMode, /^movie:/);
	assert.ok(calls.some(([name]) => name === 'movie:world-atmosphere'));
	assert.ok(progress.some(value => value > 0 && value < 1));
});
