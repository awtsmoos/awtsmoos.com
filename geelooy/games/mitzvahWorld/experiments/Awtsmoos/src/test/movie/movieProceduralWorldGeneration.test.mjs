// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProceduralWorldGeneration.test.mjs
 * @description Proves seeded world prompts compile deterministically and drive real MinimalMeadow stage contracts.
 * The Awtsmoos is beyond seed and region while each finite generated world must return the selfsame receipt;
 * Awtsmoos.com verifies package, position, atmosphere, progress, and JSON evidence remain complete.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieMitzvahWorldStages } from '../../movie/MovieMitzvahWorldStages.js';
import { createMovieProceduralRandom } from '../../movie/MovieProceduralSeed.js';
import { loadMovieWorld } from '../../movie/MovieWorldLoader.js';
import { compileMovieWorldPrompt } from '../../movie/MovieWorldPromptCompiler.js';
import { isMovieWorldSpec } from '../../movie/MovieWorldSpec.js';

test('seeded random and prompt world compilation are deterministic', () => {
	const left = createMovieProceduralRandom(613, 'village');
	const right = createMovieProceduralRandom(613, 'village');
	assert.deepEqual(
		[left.number(), left.integer(1, 10), left.pick(['a', 'b', 'c'])],
		[right.number(), right.integer(1, 10), right.pick(['a', 'b', 'c'])]
	);
	const first = compileMovieWorldPrompt(
		'A family crosses the river at golden hour to perform a mitzvah.',
		{ seed: 77 }
	);
	const second = compileMovieWorldPrompt(
		'A family crosses the river at golden hour to perform a mitzvah.',
		{ seed: 77 }
	);
	assert.deepEqual(first, second);
	assert.equal(isMovieWorldSpec(first), true);
	assert.match(
		first.regionId,
		/river|village|meadow|hill|road|slope|terraces|quarry|summit/
	);
	assert.doesNotThrow(() => JSON.stringify(first));
});

test('generated world stages drive package, region, rich-world, and atmosphere receipts', async () => {
	const calls = [];
	const runtime = {
		bus: { emit: (name, payload) => calls.push([name, payload]) },
		featuresPromise: Promise.resolve({ essentialReady: true }),
		model: {
			position: {
				set: (...values) => calls.push(['position', values])
			}
		},
		movementRecovery: {
			checkpoint: value => calls.push(['checkpoint', value.x])
		},
		optionalFeaturePromise: Promise.resolve({ optionalReady: true }),
		regionPackages: {
			diagnostics: () => ({ activeId: 'lower-meadow' }),
			transition: async id => ({ activeId: id, loads: 1 })
		},
		regions: {
			snapshot: () => ({ currentRegionId: 'river-rise' }),
			update: force => calls.push(['region-update', force])
		},
		richWorldPromise: Promise.resolve({ richWorldReady: true }),
		state: {},
		terrain: { heightAt: () => 4 },
		worldMode: 'minimal-meadow'
	};
	const world = compileMovieWorldPrompt(
		'A river journey with reeds.',
		{ seed: 8 }
	);
	const progress = [];
	const result = await loadMovieWorld({
		onProgress: state => progress.push(state.progress),
		stages: createMovieMitzvahWorldStages(
			runtime,
			world,
			{ sceneId: 'opening' }
		)
	});
	assert.equal(result.status, 'ready');
	assert.equal(result.progress, 1);
	assert.equal(runtime.movieWorldSpec.id, world.id);
	assert.match(runtime.worldMode, /^movie:/);
	assert.ok(calls.some(([name]) => name === 'movie:world-atmosphere'));
	assert.ok(progress.some(value => value > 0 && value < 1));
});
