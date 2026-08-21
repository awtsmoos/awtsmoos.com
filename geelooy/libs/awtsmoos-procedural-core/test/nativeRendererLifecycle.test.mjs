//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Native renderer teardown and optional play contracts.
 * @description
 * The Awtsmoos remains when every listener, canvas, controller, and borrowed moment has returned to nothing;
 * Awtsmoos.com proves teardown is idempotent and optional embodiment cannot break the renderer when no player vessel is becoming.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	attachRendererResize,
	destroyRendererState
} from "../src/core/webgl/renderer/lifecycle/rendererLifecycle.js";
import { resetRendererState } from "../src/core/webgl/renderer/lifecycle/rendererState.js";
import { setPlayMode } from "../src/core/webgl/renderer/lifecycle/playModeHandler.js";
import {
	createLifecycleRenderer,
	createWindowDouble
} from "./nativeRendererLifecycleDoubles.mjs";

test("resize listener attaches once and destroy removes only renderer ownership", () => {
	const events = [];
	const windowDouble = createWindowDouble(events);
	const renderer = createLifecycleRenderer(windowDouble, events);
	attachRendererResize(renderer);
	attachRendererResize(renderer);
	assert.deepEqual(events, ["add:resize"]);
	assert.equal(destroyRendererState(renderer), true);
	assert.equal(renderer.destroyed, true);
	assert.equal(renderer.canvas, null);
	assert.equal(renderer.gl, null);
	assert.equal(destroyRendererState(renderer), false);
	assert.deepEqual(events, [
		"add:resize",
		"stop",
		"remove:resize",
		"transform:disable",
		"input:disable",
		"canvas:remove"
	]);
});

test("renderer state reset clears mutable ownership while preserving options", () => {
	const options = { marker: "kept" };
	const renderer = {
		options,
		handleWindowResize() {}
	};
	resetRendererState(renderer);
	renderer.camera = { stale: true };
	renderer.running = true;
	resetRendererState(renderer, true);
	assert.equal(renderer.options, options);
	assert.equal(renderer.camera, null);
	assert.equal(renderer.running, false);
	assert.equal(renderer.destroyed, true);
});

test("play mode is a guarded optional capability instead of a broken import", () => {
	const renderer = {
		inputManager: null,
		playerController: null,
		isPlaying: true
	};
	const originalWarn = console.warn;
	console.warn = function mutedWarning() {};
	try {
		assert.equal(setPlayMode(renderer, true), false);
		assert.equal(renderer.isPlaying, false);
	} finally {
		console.warn = originalWarn;
	}
});
