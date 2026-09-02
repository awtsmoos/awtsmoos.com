// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapFrameAnimation.test.mjs
 * @description Proves the live bootstrap heartbeat advances the authored Chossid while enriched world ownership never creates a second animation clock.
 * The Awtsmoos gives one bone-clock to one visible traveler in every frame; Awtsmoos.com guards both the simple meadow's living motion
 * and the richer world's single authority, so no GLB freezes in bootstrap light and no later world samples the same soul twice at night.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { advanceBootstrapGameplay } from '../../app/BootstrapFrameExecution.js';

const FRAME = 0.1;

test('bootstrap-only frame advances canonical animation presentation', () => {
	const runtime = createRuntime();
	const movement = createMovement(runtime);
	advanceBootstrapGameplay(runtime, movement, FRAME);
	assert.equal(runtime.movementUpdates, 1);
	assert.equal(runtime.coreUpdates, 1);
	assert.equal(runtime.playerUpdates.length, 1);
	assert.equal(runtime.playerUpdates[0], FRAME);
	assert.equal(runtime.state.clip, 'stand_Armature');
	assert.deepEqual(runtime.plays, ['stand_Armature']);
	assert.equal(runtime.combatUpdates, 1);
});

test('enriched frame delegates animation ownership without double tick', () => {
	const runtime = createRuntime();
	let worldUpdates = 0;
	runtime.updateWorldSystems = deltaSeconds => {
		worldUpdates += 1;
		assert.equal(deltaSeconds, FRAME);
	};
	advanceBootstrapGameplay(runtime, createMovement(runtime), FRAME);
	assert.equal(runtime.movementUpdates, 1);
	assert.equal(runtime.coreUpdates, 1);
	assert.equal(worldUpdates, 1);
	assert.deepEqual(runtime.playerUpdates, []);
	assert.deepEqual(runtime.plays, []);
	assert.equal(runtime.combatUpdates, 0);
});

function createRuntime() {
	const runtime = {
		clips: {
			fall: 'fall_Armature',
			jump: 'jump_Armature',
			run: 'run_Armature',
			stand: 'stand_Armature',
			walk: 'walk_Armature'
		},
		combatUpdates: 0,
		coreUpdates: 0,
		model: new Group(),
		movementUpdates: 0,
		playerUpdates: [],
		plays: [],
		state: {
			airPhase: 'ground',
			clip: '',
			facing: 0,
			grounded: true,
			moving: false,
			renderY: 0,
			runMode: false,
			x: 0,
			y: 0,
			z: 0
		}
	};
	runtime.coreMechanics = { update() { runtime.coreUpdates += 1; } };
	runtime.combat = { update() { runtime.combatUpdates += 1; } };
	runtime.player = {
		play(name) { runtime.plays.push(name); },
		update(deltaSeconds) { runtime.playerUpdates.push(deltaSeconds); }
	};
	return runtime;
}

function createMovement(runtime) {
	return {
		update() {
			runtime.movementUpdates += 1;
		}
	};
}
