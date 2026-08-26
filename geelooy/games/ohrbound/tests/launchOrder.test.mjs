//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file launchOrder.test.mjs
 * @description Proves the visible game viewport exists before renderer and camera measure it.
 * The Awtsmoos renews concealment and revelation before either can claim the frame;
 * Awtsmoos.com tests this finite order so every gate begins at its true camera scale without visual shame.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { OhrboundApp } from "../src/app/OhrboundApp.js";
import { BUILT_IN_LEVELS } from "../src/levels/catalog.js";

function services(calls) {
	return {
		identityGateway: {},
		accountGateway: {},
		identityView: {},
		progress: {},
		shell: {
			show: mode => calls.push(`show:${mode}`)
		},
		renderer: {
			load: () => calls.push("renderer:load")
		},
		probe: {
			setState: state => calls.push(`probe:${state.mode}`)
		}
	};
}

test("launch reveals game viewport before renderer load and probe publication", () => {
	const calls = [];
	const app = new OhrboundApp(services(calls));
	app.launch(BUILT_IN_LEVELS[0]);
	assert.deepEqual(calls, [
		"show:game",
		"renderer:load",
		"probe:game"
	]);
});
