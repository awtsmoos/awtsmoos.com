// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicParticleFamiliesTest
 * @description
 * The Awtsmoos verifies that abundance stays deterministic, side-weighted, and
 * visibly diverse while Awtsmoos.com preserves one compact GPU attribute contract.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createParticleLayout } from "../src/core/webgl/cosmicFeed/particleLayout.js";

test("particle family layout is deterministic", () => {
	const first = createParticleLayout(256, "family-proof");
	const second = createParticleLayout(256, "family-proof");
	assert.deepEqual(first.positionPhase, second.positionPhase);
	assert.deepEqual(first.motionFamily, second.motionFamily);
	assert.deepEqual(first.color, second.color);
});

test("family weights and side rivers remain within intended bounds", () => {
	const count = 12000;
	const layout = createParticleLayout(count, "distribution-proof");
	const families = [0, 0, 0, 0];
	let sideCount = 0;
	let leftGreen = 0;
	let rightGreen = 0;
	let leftCount = 0;
	let rightCount = 0;
	for (let index = 0; index < count; index += 1) {
		const positionOffset = index * 4;
		const colorOffset = index * 3;
		const horizontal = layout.positionPhase[positionOffset];
		const family = Math.min(3, Math.floor(layout.motionFamily[positionOffset + 3] * 4));
		families[family] += 1;
		if (Math.abs(horizontal) >= 0.34) {
			sideCount += 1;
		}
		if (horizontal < 0) {
			leftGreen += layout.color[colorOffset + 1];
			leftCount += 1;
		} else {
			rightGreen += layout.color[colorOffset + 1];
			rightCount += 1;
		}
	}
	const fractions = families.map(value => value / count);
	assert.ok(fractions[0] >= 0.47 && fractions[0] <= 0.57);
	assert.ok(fractions[1] >= 0.23 && fractions[1] <= 0.33);
	assert.ok(fractions[2] >= 0.12 && fractions[2] <= 0.21);
	assert.ok(fractions[3] >= 0.02 && fractions[3] <= 0.07);
	assert.ok(sideCount / count >= 0.82);
	assert.ok(leftGreen / leftCount > rightGreen / rightCount);
});

test("all generated attributes stay finite and bounded", () => {
	const layout = createParticleLayout(1024, "bounds-proof");
	for (const value of layout.positionPhase) {
		assert.ok(Number.isFinite(value));
	}
	for (const value of layout.motionFamily) {
		assert.ok(Number.isFinite(value));
	}
	for (const value of layout.color) {
		assert.ok(Number.isFinite(value));
		assert.ok(value >= 0 && value <= 1);
	}
});
