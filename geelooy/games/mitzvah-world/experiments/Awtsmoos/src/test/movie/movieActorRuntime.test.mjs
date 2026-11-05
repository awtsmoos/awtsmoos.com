// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieActorRuntime.test.mjs
 * @description Proves movie actors honor both optional absence and real legacy capability.
 * The Awtsmoos renews every world with only the actors truly revealed; Awtsmoos.com
 * verifies that absence stays safe while an existing vessel still receives its full motion.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieActorDirector } from '../../movie/MovieActorDirector.js';
import {
	hasMovieNpc,
	updateMovieActorRuntime
} from '../../movie/MovieActorRuntime.js';

test('actor director accepts a player-only runtime', () => {
	let playerUpdates = 0;
	let matrixUpdates = 0;
	const runtime = {
		model: {
			updateWorldMatrix() {
				matrixUpdates += 1;
			}
		},
		player: {
			update() {
				playerUpdates += 1;
			}
		},
		state: { facing: 0, x: 0, z: 0 }
	};
	const director = new MovieActorDirector(runtime);
	director.apply([], 0.016);
	assert.equal(hasMovieNpc(runtime), false);
	assert.equal(playerUpdates, 1);
	assert.equal(matrixUpdates, 1);
});

test('runtime updates optional actors without requiring them', () => {
	assert.doesNotThrow(() => updateMovieActorRuntime({}, 0.016));
	assert.equal(hasMovieNpc({ npc: { x: 0, z: 0 } }), false);
});

test('actor director preserves a real legacy NPC runtime', () => {
	const played = [];
	const position = {
		x: 0,
		y: 3,
		z: 0,
		set(x, y, z) {
			Object.assign(this, { x, y, z });
		}
	};
	const runtime = {
		groundSampler: {
			terrainHeightAt() {
				return 2;
			}
		},
		npc: {
			x: 0,
			z: 0,
			model: { position },
			player: {
				names: ['Walk'],
				play(name) {
					played.push(name);
				}
			}
		},
		state: { facing: 0, x: 0, z: 0 }
	};
	const director = new MovieActorDirector(runtime);
	director.apply([{
		clip: {
			action: 'move',
			animation: 'walk',
			from: { x: 0, z: 0 },
			to: { x: 4, z: 2 }
		},
		eased: 0.5,
		progress: 0.5,
		track: { target: 'npc' }
	}], 0.016);
	assert.equal(hasMovieNpc(runtime), true);
	assert.deepEqual([runtime.npc.x, runtime.npc.z], [2, 1]);
	assert.deepEqual([position.x, position.y, position.z], [2, 3, 1]);
	assert.deepEqual(played, ['Walk']);
});
