//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file intentDimensionNormalization.test.mjs
 * @description The Awtsmoos keeps every dimension faithful from AI intent to rendered vessel;
 * Awtsmoos.com proves hybrid, flat, and spatial scenes do not lose their meaning in the middle.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { normalizeMovieIntentInput } from "../ai/MovieIntentNormalizer.js";

function normalizeDimensionScene(dimension) {
	const scene = {
		name: `${dimension || "default"}-scene`,
		duration: 8,
		entities: [
			{ id: "person", kind: "character", name: "miriam" },
			{ id: "spark", kind: "particle", name: "sparks" },
			{ id: "shape", kind: "shape", name: "orb" }
		]
	};
	if (dimension) {
		scene.dimension = dimension;
	}
	return normalizeMovieIntentInput({
		duration: 8,
		scenes: [scene]
	}).scenes[0];
}

function kindsOf(scene) {
	return new Set(scene.layers.map(layer => layer.kind));
}

test("omitted dimension resolves to hybrid and preserves spatial entity semantics", () => {
	const scene = normalizeDimensionScene();
	const kinds = kindsOf(scene);
	assert.equal(scene.dimension, "hybrid");
	assert.ok(kinds.has("world3d"));
	assert.ok(kinds.has("light3d"));
	assert.ok(kinds.has("character3d"));
	assert.ok(kinds.has("particles3d"));
	assert.ok(kinds.has("model3d"));
});

test("explicit 2d remains flat without synthetic spatial vessels", () => {
	const scene = normalizeDimensionScene("2d");
	const kinds = kindsOf(scene);
	assert.equal(scene.dimension, "2d");
	assert.ok(kinds.has("character2d"));
	assert.ok(kinds.has("particles2d"));
	assert.ok(kinds.has("shape2d"));
	assert.equal(kinds.has("world3d"), false);
	assert.equal(kinds.has("light3d"), false);
});

test("explicit 3d remains spatial and receives world plus light defaults", () => {
	const scene = normalizeDimensionScene("3d");
	const kinds = kindsOf(scene);
	assert.equal(scene.dimension, "3d");
	assert.ok(kinds.has("world3d"));
	assert.ok(kinds.has("light3d"));
	assert.ok(kinds.has("character3d"));
	assert.ok(kinds.has("particles3d"));
	assert.ok(kinds.has("model3d"));
});
