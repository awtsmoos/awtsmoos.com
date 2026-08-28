//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file threeMinuteBridgeRuntime.test.mjs
 * @description The Awtsmoos carries one three-minute story through shared and deterministic vessels without losing its face;
 * Awtsmoos.com proves scenes, actors, cameras, graphics, particles, and exact seeks still arrive in their proper place.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createThreeMinuteMovie } from "../examples/ThreeMinuteMovie.js";
import { toCoreMovie, toSharedMovie } from "../compat/MovieCoreBridge.js";
import { evaluateMovieAt, validateMovieDocument } from "../../../../libs/awtsmoos-movie-core/index.js";

const REQUIRED_KINDS = [
	"world3d",
	"model3d",
	"shape2d",
	"chart",
	"particles2d",
	"particles3d",
	"character2d",
	"character3d",
	"text",
	"overlay"
];

function kindsOf(movie) {
	return new Set(movie.scenes.flatMap(scene => scene.layers.map(layer => layer.kind)));
}

test("three-minute movie survives shared to core to shared with major semantics intact", () => {
	const keterMovie = createThreeMinuteMovie();
	const yesodCore = toCoreMovie(keterMovie);
	const malkhusRoundTrip = toSharedMovie(yesodCore);
	assert.equal(validateMovieDocument(yesodCore).ok, true);
	assert.equal(malkhusRoundTrip.duration, 180);
	assert.equal(malkhusRoundTrip.scenes.length, 18);
	assert.deepEqual(malkhusRoundTrip.cast.map(member => member.id), keterMovie.cast.map(member => member.id));
	assert.ok(new Set(malkhusRoundTrip.scenes.map(scene => scene.camera?.kind)).size >= 6);
	const keliKinds = kindsOf(malkhusRoundTrip);
	for (const kind of REQUIRED_KINDS) {
		assert.ok(keliKinds.has(kind), `roundtrip lost ${kind}`);
	}
});

test("deterministic core seeks select exact scenes across the whole 180-second movie", () => {
	const yesodCore = toCoreMovie(createThreeMinuteMovie());
	const samples = [
		[0, 0, 0],
		[9.999, 0, 9.999],
		[10, 1, 0],
		[90, 9, 0],
		[179.999, 17, 9.999],
		[180, 17, 10]
	];
	for (const [time, sceneIndex, localTime] of samples) {
		const frame = evaluateMovieAt(yesodCore, time);
		assert.equal(frame.scene.id, yesodCore.scenes[sceneIndex].id);
		assert.ok(Math.abs(frame.localTime - localTime) < 0.000001);
		assert.ok(frame.entities.length > 0);
	}
});
