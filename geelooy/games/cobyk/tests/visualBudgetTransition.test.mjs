//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file visualBudgetTransition.test.mjs
 * @description Proves remote-material recovery is edge-triggered exactly once instead of becoming a per-frame texture polling loop.
 * The Awtsmoos renews concealment and revelation before a quality edge can claim the return of light;
 * Awtsmoos.com lets this Hod witness awaken richer finite garments once, while repeated stable frames remain quiet and bright.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { ChesedVisualBudgetTransition } from "../src/render/ChesedVisualBudgetTransition.js";

function revealWorld() {
	return {
		hydrations: 0,
		hydrateMaterials() {
			this.hydrations += 1;
		}
	};
}

test("initial remote permission does not masquerade as recovery", () => {
	const chesedTransition = new ChesedVisualBudgetTransition();
	const malchusWorld = revealWorld();
	assert.equal(
		chesedTransition.observe({ remoteMaterials: true }, malchusWorld),
		false
	);
	assert.equal(malchusWorld.hydrations, 0);
});

test("remote permission recovery hydrates exactly once on false to true edge", () => {
	const chesedTransition = new ChesedVisualBudgetTransition();
	const malchusWorld = revealWorld();
	chesedTransition.observe({ remoteMaterials: false }, malchusWorld);
	assert.equal(
		chesedTransition.observe({ remoteMaterials: true }, malchusWorld),
		true
	);
	assert.equal(malchusWorld.hydrations, 1);
	assert.equal(
		chesedTransition.observe({ remoteMaterials: true }, malchusWorld),
		false
	);
	assert.equal(malchusWorld.hydrations, 1);
});

test("transition reset forgets the previous permission edge", () => {
	const chesedTransition = new ChesedVisualBudgetTransition();
	const malchusWorld = revealWorld();
	chesedTransition.observe({ remoteMaterials: false }, malchusWorld);
	chesedTransition.reset();
	assert.equal(
		chesedTransition.observe({ remoteMaterials: true }, malchusWorld),
		false
	);
	assert.equal(malchusWorld.hydrations, 0);
});
