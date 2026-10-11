// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzAnimationMotion.test.js
 * @description Integration guard for the player presentation frame: the walk clip
 * is chosen while traveling, stride phase advances with measured distance, the
 * visible model breathes with bob/roll, and authoritative state (position, facing,
 * displacement) is never altered by presentation — the acceptance movement proof
 * must observe identical physics.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { updatePlayerPresentation } from './EretzAnimationMotion.js';

function fakeRuntime() {
	const played = [];
	const player = {
		clips: [
			{ duration: 2, name: 'stand_Armature' },
			{ duration: 1.1, name: 'walk_Armature' },
			{ duration: 0.8, name: 'run_Armature' }
		],
		current: null,
		play(name) { this.current = name; played.push(name); },
		update() {}
	};
	const model = {
		position: {
			x: 0, y: 0, z: 0,
			set(x, y, z) { this.x = x; this.y = y; this.z = z; }
		},
		quaternion: {
			x: 0, y: 0, z: 0, w: 1,
			set(x, y, z, w) { this.x = x; this.y = y; this.z = z; this.w = w; }
		},
		updateWorldMatrix() {}
	};
	return {
		clips: {
			fall: 'fall_Armature',
			jump: 'jump_Armature',
			run: 'run_Armature',
			stand: 'stand_Armature',
			walk: 'walk_Armature'
		},
		model,
		played,
		player,
		state: {
			clip: '',
			facing: 0,
			grounded: true,
			moving: true,
			renderY: 0,
			runMode: false,
			x: 0,
			y: 0,
			z: 0
		}
	};
}

const DT = 1 / 60;

test('walking selects the walk clip and advances stride with distance', () => {
	const runtime = fakeRuntime();
	for (let i = 0; i < 40; i++) {
		runtime.state.x += 3.7 * DT;
		updatePlayerPresentation(runtime, DT);
	}
	assert.equal(runtime.state.clip, 'walk_Armature');
	const stride = runtime.locomotionStrideState;
	assert.ok(stride.phase > 0, 'stride phase advanced');
	assert.equal(stride.stepIndex > 0, true, 'footsteps registered');
});

test('presentation never alters authoritative physics state', () => {
	const runtime = fakeRuntime();
	const frames = 60;
	for (let i = 0; i < frames; i++) {
		runtime.state.x += 3.7 * DT;
		updatePlayerPresentation(runtime, DT);
	}
	const expected = 3.7 * frames * DT;
	assert.ok(Math.abs(runtime.state.x - expected) < 1e-9, `displacement exact: ${runtime.state.x}`);
	assert.equal(runtime.state.facing, 0, 'facing untouched by presentation');
	assert.equal(runtime.model.position.x, runtime.state.x, 'model follows state x exactly');
	assert.ok(
		Math.abs(runtime.model.position.y - runtime.state.renderY) <= 0.023,
		'bob is a small visual offset only'
	);
	const q = runtime.model.quaternion;
	assert.ok(Math.abs(Math.hypot(q.x, q.y, q.z, q.w) - 1) < 1e-9, 'model quaternion stays unit');
});

test('stopping plants the character back on the stand clip', () => {
	const runtime = fakeRuntime();
	for (let i = 0; i < 30; i++) {
		runtime.state.x += 3.7 * DT;
		updatePlayerPresentation(runtime, DT);
	}
	assert.equal(runtime.state.clip, 'walk_Armature');
	runtime.state.moving = false;
	for (let i = 0; i < 30; i++) {
		updatePlayerPresentation(runtime, DT);
	}
	assert.equal(runtime.state.clip, 'stand_Armature', 'stand returns immediately on stop');
	const stride = runtime.locomotionStrideState;
	assert.ok(stride.strideWeight < 0.05, `stride weight decays when planted: ${stride.strideWeight}`);
	assert.ok(Math.abs(stride.bobY) < 0.001, 'bob settles when planted');
	assert.ok(Math.abs(stride.roll) < 0.001, 'roll settles when planted');
});
