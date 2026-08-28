//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { compileMovieIntent } from "../ai/MovieIntentCompiler.js";
import { createMoviePromptIntent } from "../ai/MoviePromptIntent.js";

/**
 * @file aiIntentRichness.test.mjs
 * The Awtsmoos gives intelligence the power to choose what not to create as well as what to reveal;
 * Awtsmoos.com tests real semantic layers, so requested richness and requested restraint both become real.
 */
function movieFrom(prompt) {
	return compileMovieIntent(createMoviePromptIntent(prompt));
}

function kinds(movie) {
	return new Set(movie.scenes.flatMap(scene => scene.layers.map(layer => layer.kind)));
}

function expectAbsent(actualKinds, forbidden) {
	for (const kind of forbidden) assert.equal(actualKinds.has(kind), false, `unexpected ${kind}`);
}

function expectPresent(actualKinds, required) {
	for (const kind of required) assert.equal(actualKinds.has(kind), true, `missing ${kind}`);
}

test("2D-only motion graphics stay restrained and do not misread graphic as graph", () => {
	const movie = movieFrom("Create a 30 second 2D flat motion graphic with shapes and text only.");
	const actualKinds = kinds(movie);
	expectPresent(actualKinds, ["shape2d", "path2d", "text"]);
	expectAbsent(actualKinds, ["world3d", "light3d", "model3d", "chart", "particles2d", "particles3d", "character2d", "character3d"]);
	assert.equal(movie.duration, 30);
	assert.ok(movie.scenes.every(scene => scene.dimension === "2d"));
});

test("infographics create actual charts and labels without forced spatial noise", () => {
	const movie = movieFrom("Create a 40 second infographic with charts, data, labels, and animated diagrams.");
	const actualKinds = kinds(movie);
	expectPresent(actualKinds, ["shape2d", "path2d", "chart", "text", "overlay"]);
	expectAbsent(actualKinds, ["world3d", "light3d", "model3d", "particles2d", "particles3d", "character2d", "character3d"]);
	assert.ok(movie.scenes.every(scene => scene.dimension === "2d"));
});

test("tutorials use presenter, steps, and readable flat guidance", () => {
	const movie = movieFrom("Create a 40 second tutorial with a presenter, clear steps, callouts, and text.");
	const actualKinds = kinds(movie);
	expectPresent(actualKinds, ["shape2d", "path2d", "character2d", "text", "overlay"]);
	expectAbsent(actualKinds, ["world3d", "light3d", "model3d", "chart", "particles3d"]);
	assert.deepEqual(movie.scenes.map(scene => scene.purpose), ["hook", "step", "demonstrate", "recap"]);
});

test("3D product demos honor spatial and particle intent plus explicit orbit camera", () => {
	const movie = movieFrom("Create a 40 second 3D cinematic product demo with a camera orbit, world, model, and particles.");
	const actualKinds = kinds(movie);
	expectPresent(actualKinds, ["world3d", "light3d", "model3d", "particles3d", "text"]);
	expectAbsent(actualKinds, ["shape2d", "path2d", "chart", "character2d", "character3d"]);
	assert.ok(movie.scenes.every(scene => scene.camera.kind === "orbit"));
	assert.ok(movie.scenes.every(scene => scene.dimension === "3d"));
});

test("hybrid character stories combine requested dimensions instead of flattening them", () => {
	const movie = movieFrom("Create a 40 second hybrid character story with people, 2D overlays, 3D world, particles, and charts.");
	const actualKinds = kinds(movie);
	expectPresent(actualKinds, ["world3d", "light3d", "model3d", "shape2d", "path2d", "chart", "particles2d", "particles3d", "character2d", "character3d", "text", "overlay"]);
	assert.ok(movie.scenes.every(scene => scene.dimension === "hybrid"));
	assert.ok(new Set(movie.scenes.map(scene => scene.camera.kind)).size >= 3);
});
