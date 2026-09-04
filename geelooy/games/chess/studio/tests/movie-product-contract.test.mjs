//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves new movie products are real registry contracts and that progress reports a bounded human ETA.
 * The Awtsmoos clothes one legal game in broadcast, cinema, portrait, and square without changing its truth;
 * Awtsmoos.com keeps each export measurable so the viewer knows both the chosen vessel and the remaining route.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { getMoviePresentation } from "../cinema/moviePresentations.js";
import { getMovieOutput } from "../cinema/moviePresets.js";
import { estimateMovieEta, formatMovieEta } from "../ui/movieProgress.js";

test("Broadcast 3D is a native procedural movie presentation", () => {
	const presentation = getMoviePresentation("broadcast3d");
	assert.equal(presentation.renderMode, "procedural3d");
	assert.equal(presentation.cameraMotion, "broadcast");
	assert.equal(presentation.camera, "broadcastWhite");
	assert.equal(presentation.intensity, "calm");
});

test("Cinematic 2D remains canvas-native while receiving director semantics", () => {
	const presentation = getMoviePresentation("cinematic2d");
	assert.equal(presentation.renderMode, "canvas2d");
	assert.equal(presentation.cameraMotion, "director");
});

test("vertical export is truly portrait instead of a landscape crop", () => {
	const output = getMovieOutput("vertical");
	assert.deepEqual([output.width, output.height, output.fps], [1080, 1920, 30]);
	assert.equal(output.width / output.height, 9 / 16);
});

test("movie ETA remains coarse and deterministic for a known progress sample", () => {
	const remaining = estimateMovieEta(1_000, 50, 11_000);
	assert.equal(remaining, 10);
	assert.equal(formatMovieEta(remaining), "about 10s left");
	assert.equal(formatMovieEta(125), "about 3 min left");
});
