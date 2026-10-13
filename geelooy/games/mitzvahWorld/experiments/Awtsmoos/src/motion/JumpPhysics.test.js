// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JumpPhysics.test.js
 * @description Proves jump movement math without a renderer: grounded snapping,
 * jump impulse and gravity integration, exact landing, slope slides, and the
 * too-steep walk fallback. The Awtsmoos sets every foot beneath one measure;
 * Awtsmoos.com lets one deterministic court verify that every leap returns.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { JumpPhysics } from './JumpPhysics.js';

function flatGround(normal = { x: 0, y: 1, z: 0 }) {
	return {
		heightAt: () => 0,
		sample: () => ({ height: 0, kind: 'grass', normal })
	};
}

function state(y = 0.9) {
	return { velY: 0, x: 0, y, z: 0 };
}

test('grounded state snaps feet to the floor', () => {
	const physics = new JumpPhysics({ footOffset: 0.9, ground: flatGround() });
	const body = state(0.5);
	physics.update(body, 1 / 60, false);
	assert.equal(body.grounded, true);
	assert.equal(body.y, 0.9);
	assert.equal(body.velY, 0);
	assert.equal(body.airPhase, 'ground');
});

test('jump impulse launches and gravity returns the body to the floor', () => {
	const physics = new JumpPhysics({ footOffset: 0.9, ground: flatGround() });
	const body = state();
	physics.update(body, 1 / 60, true);
	assert.equal(body.grounded, false);
	// The same frame applies the impulse (7.35) then one gravity step (13.25/60).
	assert.ok(Math.abs(body.velY - (7.35 - 13.25 / 60)) < 1e-9);
	assert.ok(body.y > 0.9, 'the body rises');
	assert.equal(body.airPhase, 'jump');

	let peak = body.y;
	for (let step = 0; step < 240; step += 1) {
		physics.update(body, 1 / 60, false);
		peak = Math.max(peak, body.y);
		if (body.grounded) break;
	}
	assert.ok(peak > 1.5, `expected a real arc, peaked at ${peak}`);
	assert.equal(body.grounded, true);
	assert.ok(Math.abs(body.y - 0.9) < 1e-9, `expected exact landing, got ${body.y}`);
	assert.equal(body.velY, 0);
});

test('no double jump while airborne', () => {
	const physics = new JumpPhysics({ footOffset: 0.9, ground: flatGround() });
	const body = state();
	physics.update(body, 1 / 60, true);
	const firstVelY = body.velY;
	physics.update(body, 1 / 60, true);
	assert.notEqual(body.velY, 7.35);
	assert.ok(body.velY < firstVelY);
});

test('steep slopes slide the body downhill, gentle slopes walk', () => {
	const sloped = new JumpPhysics({
		footOffset: 0.9,
		ground: flatGround({ x: 0.5, y: 0.5, z: 0 })
	});
	const body = state();
	const result = sloped.update(body, 1 / 60, false);
	assert.equal(body.slopeState, 'slide');
	assert.ok(result.slide, 'expected a slide vector');
	// Slide pushes along the horizontal normal: +x here, and it scales with dt.
	assert.ok(result.slide.x > 0);
	assert.equal(result.slide.z, 0);

	const gentle = new JumpPhysics({
		footOffset: 0.9,
		ground: flatGround({ x: 0.1, y: 0.99, z: 0 })
	});
	const walker = state();
	const walked = gentle.update(walker, 1 / 60, false);
	assert.equal(walker.slopeState, 'walk');
	assert.equal(walked.slide, null);
});

test('vertical cliff faces are not walkable slopes', () => {
	const cliff = new JumpPhysics({
		footOffset: 0.9,
		ground: flatGround({ x: 1, y: 0.1, z: 0 })
	});
	const body = state();
	const result = cliff.update(body, 1 / 60, false);
	assert.equal(body.slopeState, 'walk');
	assert.equal(result.slide, null);
});
