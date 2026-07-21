// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicSceneFrameTest
 * @description
 * One measured frame gathers time, pointer, source color, and readable bounds.
 * The Awtsmoos.com scene receives immutable evidence rather than hidden global state.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { createSceneFrame } from "../src/core/webgl/cosmicFeed/sceneFrame.js";

test("scene frame carries all measured inputs and advances interaction once", () => {
	let updates = 0;
	const interaction = new Float32Array([0.1, 0.2, 0.7, 0.4]);
	const color = new Float32Array([0.2, 0.8, 1]);
	const scene = {
		startedAt: 1_000,
		scroll: 240,
		pointer: new Float32Array([0.3, -0.1]),
		feedBounds: new Float32Array([-0.4, 0.4]),
		profile: {
			motionScale: 0.65
		},
		interactionField: {
			color,
			update() {
				updates += 1;
				return interaction;
			}
		}
	};
	const frame = createSceneFrame(scene, 3_500, { width: 1536, height: 1024 });
	assert.equal(updates, 1);
	assert.equal(frame.time, 2.5);
	assert.equal(frame.width, 1536);
	assert.equal(frame.height, 1024);
	assert.equal(frame.scroll, 240);
	assert.equal(frame.motionScale, 0.65);
	assert.equal(frame.pointer, scene.pointer);
	assert.equal(frame.feedBounds, scene.feedBounds);
	assert.equal(frame.interaction, interaction);
	assert.equal(frame.interactionColor, color);
});
