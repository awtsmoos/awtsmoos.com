// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicParticleLayoutTest
 * @description
 * The Awtsmoos verifies that one deterministic field becomes three luminous
 * rivers while Awtsmoos.com preserves bilateral balance and a quiet reading core.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createParticleLayout } from "../src/core/webgl/cosmicFeed/particleLayout.js";

function horizontalValues(layout) {
	const values = [];
	for (let offset = 0; offset < layout.positionPhase.length; offset += 4) {
		values.push(layout.positionPhase[offset]);
	}
	return values;
}

test("the particle layout is deterministic for one seed", () => {
	const first = createParticleLayout(1024, "three-rivers");
	const second = createParticleLayout(1024, "three-rivers");
	assert.deepEqual(first.positionPhase, second.positionPhase);
	assert.deepEqual(first.motionFamily, second.motionFamily);
	assert.deepEqual(first.color, second.color);
});

test("the center remains protected while three side rivers stay populated", () => {
	const values = horizontalValues(createParticleLayout(12000, "three-rivers"));
	const absolute = values.map(Math.abs);
	const center = absolute.filter(value => value < 0.28).length;
	const inner = absolute.filter(value => value >= 0.34 && value < 0.56).length;
	const middle = absolute.filter(value => value >= 0.56 && value < 0.79).length;
	const outer = absolute.filter(value => value >= 0.79).length;
	assert.ok(center / values.length < 0.015);
	assert.ok(inner > 1800);
	assert.ok(middle > 1500);
	assert.ok(outer > 1200);
});

test("left and right particle populations remain balanced", () => {
	const values = horizontalValues(createParticleLayout(12000, "balanced-rivers"));
	const left = values.filter(value => value < 0).length;
	const right = values.filter(value => value > 0).length;
	assert.ok(Math.abs(left - right) / values.length < 0.04);
});
