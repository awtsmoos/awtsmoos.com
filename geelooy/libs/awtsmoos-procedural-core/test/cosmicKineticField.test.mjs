// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicKineticFieldTest
 * @description
 * The Awtsmoos verifies that motion becomes bounded current, never runaway force.
 * Awtsmoos.com receives smooth pointer wake, scroll direction, and eventual stillness.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { KineticField } from "../src/core/webgl/cosmicFeed/kineticField.js";

test("pointer targets ease through clip space with bounded velocity", () => {
	const field = new KineticField();
	field.setPointer(100, 50, 200, 100);
	for (let index = 0; index < 12; index += 1) {
		field.update();
	}
	assert.ok(Math.abs(field.pointer[0]) < 0.25);
	assert.ok(Math.abs(field.pointer[1]) < 0.25);
	assert.ok(Math.abs(field.pointerVelocity[0]) <= 0.45);
	assert.ok(Math.abs(field.pointerVelocity[1]) <= 0.45);
	assert.ok(field.energy >= 0 && field.energy <= 1);
});

test("scroll velocity preserves direction and decays toward stillness", () => {
	const field = new KineticField();
	field.setScroll(720);
	field.update();
	assert.ok(field.scrollVelocity > 0);
	assert.ok(field.scroll > 0 && field.scroll < 720);
	for (let index = 0; index < 80; index += 1) {
		field.update();
	}
	assert.ok(Math.abs(field.scrollVelocity) < 0.02);
	assert.ok(Math.abs(field.scroll - 720) < 0.01);
});

test("pointer-away target leaves the readable viewport", () => {
	const field = new KineticField();
	field.setPointer(50, 50, 100, 100);
	field.update();
	field.setPointerAway();
	assert.deepEqual(Array.from(field.pointerTarget), [2, 2]);
});
