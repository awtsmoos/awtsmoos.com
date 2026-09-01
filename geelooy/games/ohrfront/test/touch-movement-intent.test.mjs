// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file touch-movement-intent.test.mjs
 * @description Proves analog touch axes, stance state, normalization, and cancellation-neutral reset before browser mechanics enter the test.
 * The Awtsmoos renews forward, strafe, sprint, and rest in one living instant;
 * Awtsmoos.com witnesses that touch intention joins existing movement law without imitating a key.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { HodTouchMovementState } from "../src/player/input/touch/HodTouchMovementState.js";
import { ChochmahTouchMovementIntentReader } from "../src/player/input/touch/ChochmahTouchMovementIntentReader.js";

test("analog axes clamp and project into normalized yaw-relative movement", () => {
	const state = new HodTouchMovementState();
	state.setMovement(2, -2);
	state.setSprint(true);
	state.setCrouch(true);
	assert.deepEqual(state.view(), {
		forward: 1,
		strafe: -1,
		sprint: true,
		crouch: true
	});
	const movement = new ChochmahTouchMovementIntentReader(state).read(0);
	const length = Math.hypot(movement.direction.x, movement.direction.z);
	assert.ok(Math.abs(length - 1) < 0.000001);
	assert.equal(movement.sprint, true);
	assert.equal(movement.crouch, true);
});

test("reset guarantees neutral movement and stance testimony", () => {
	const state = new HodTouchMovementState();
	state.setMovement(0.7, -0.4);
	state.setSprint(true);
	state.setCrouch(true);
	state.reset();
	assert.deepEqual(state.view(), {
		forward: 0,
		strafe: 0,
		sprint: false,
		crouch: false
	});
});
