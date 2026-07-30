// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceMovement.test.mjs
 * @description Proves friendly Chossid motion uses collision, bounded delta, run speed, clips, and warnings.
 * The Awtsmoos lets an actor cross the stage without passing through its walls; Awtsmoos.com
 * measures collision-resolved state and admits absent jump or crouch powers in truthful rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MoviePerformanceActorMovement } from '../../movie/MoviePerformanceActorMovement.js';
import { MoviePerformanceInputState } from '../../movie/MoviePerformanceInputState.js';
import { MoviePerformanceRuntimeTarget } from '../../movie/MoviePerformanceRuntimeTarget.js';


test('friendly movement invokes collision and synchronizes model plus walk animation', () => {
	const fixture = actorFixture();
	const input = new MoviePerformanceInputState();
	const movement = new MoviePerformanceActorMovement(fixture.target, input);
	input.setIntent({ forward: 1 });
	const result = movement.update(0.5, {
		movementReference: 'character',
		walkSpeed: 4
	});
	assert.equal(fixture.collisions.length, 1);
	assert.equal(fixture.target.state.z, 0.4);
	assert.equal(fixture.model.position.z, 0.4);
	assert.equal(fixture.player.played, 'walking');
	assert.equal(result.transform.position[2], 0.4);
});


test('run travels farther and unsupported jump or crouch reports capability warnings', () => {
	const fixture = actorFixture();
	const input = new MoviePerformanceInputState();
	const movement = new MoviePerformanceActorMovement(fixture.target, input);
	input.setIntent({ crouch: true, forward: 1, jump: true, run: true });
	const result = movement.update(0.5, {
		movementReference: 'character',
		runSpeed: 8
	});
	assert.equal(fixture.target.state.z, 0.8);
	assert.equal(fixture.player.played, 'running');
	assert.ok(result.capabilityWarnings.includes('JUMP_UNSUPPORTED'));
	assert.ok(result.capabilityWarnings.includes('CROUCH_UNSUPPORTED'));
});

function actorFixture() {
	const collisions = [];
	const model = fakeModel();
	const player = {
		current: null,
		names: ['standing', 'walking', 'running'],
		play(name) {
			this.played = name;
			this.current = { name };
		}
	};
	const runtime = {
		camera: null,
		collisionMover: {
			move(state, step) {
				collisions.push({ ...step });
				state.x += step.x;
				state.z += step.z;
				return { normals: [] };
			}
		},
		terrain: {
			heightAt() {
				return 0;
			}
		}
	};
	const target = new MoviePerformanceRuntimeTarget({
		actions: null,
		actor: { update() {} },
		id: 'friendly-one',
		kind: 'human',
		model,
		modelId: 'friendly-model',
		name: 'Friendly One',
		player,
		runtime
	});
	return { collisions, model, player, target };
}

function fakeModel() {
	return {
		position: vector(),
		quaternion: {
			set(x, y, z, w) {
				Object.assign(this, { w, x, y, z });
			}
		},
		scale: vector(1),
		updateWorldMatrix() {}
	};
}

function vector(initial = 0) {
	return {
		x: initial,
		y: initial,
		z: initial,
		set(x, y, z) {
			Object.assign(this, { x, y, z });
		}
	};
}
