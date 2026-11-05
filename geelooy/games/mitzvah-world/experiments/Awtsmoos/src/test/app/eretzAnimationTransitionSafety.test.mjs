// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzAnimationTransitionSafety.test.mjs
 * @description Proves rich-world frames survive the brief interval before canonical animation clip names are published.
 * The Awtsmoos lets the Chossid remain placed and alive while names descend a heartbeat late;
 * Awtsmoos.com preserves visible motion without inventing clips, then resumes authored animation when the map enters the gate.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { updatePlayerPresentation } from '../../app/EretzAnimationMotion.js';

function transitionRuntime() {
	const updates = [];
	const plays = [];
	return {
		model: new Group(),
		player: {
			play(name) {
				plays.push(name);
			},
			update(deltaTime) {
				updates.push(deltaTime);
			}
		},
		plays,
		state: {
			airPhase: 'grounded',
			clip: '',
			facing: Math.PI / 2,
			grounded: true,
			moving: false,
			renderY: 0,
			runMode: false,
			x: 3,
			y: 1.5,
			z: -7
		},
		updates
	};
}

test('B"H missing clip map keeps the mountain frame alive and the player placed', () => {
	const runtime = transitionRuntime();
	assert.doesNotThrow(() => updatePlayerPresentation(runtime, 0.1));
	assert.deepEqual(runtime.plays, []);
	assert.deepEqual(runtime.updates, [0.1]);
	assert.equal(runtime.state.clip, '');
	assert.deepEqual(runtime.model.position.toArray(), [3, 1.5, -7]);
	assert.equal(runtime.state.animationPlaybackRate, 1);
	assert.equal(runtime.animationMotionEvidence.locomotion, 'stand');
});

test('B"H canonical clip selection resumes immediately after transition publication', () => {
	const runtime = transitionRuntime();
	updatePlayerPresentation(runtime, 0.1);
	runtime.clips = {
		fall: 'fall_Armature',
		jump: 'jump_Armature',
		run: 'run_Armature',
		stand: 'stand_Armature',
		walk: 'walk_Armature'
	};
	updatePlayerPresentation(runtime, 0.1);
	assert.deepEqual(runtime.plays, ['stand_Armature']);
	assert.equal(runtime.state.clip, 'stand_Armature');
	assert.deepEqual(runtime.updates, [0.1, 0.1]);
	assert.deepEqual(runtime.model.position.toArray(), [3, 1.5, -7]);
});
