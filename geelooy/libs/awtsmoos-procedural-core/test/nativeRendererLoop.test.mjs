//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Native renderer heartbeat and cache contracts.
 * @description
 * The Awtsmoos renews each instant without duplicating time, while Awtsmoos.com proves one RAF pulse and one renderer-owned cache;
 * stopping one finite world cancels its frame, and clearing its memory never steals a sibling world's reusable place.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	startRendererLoop,
	stopRendererLoop
} from "../src/core/webgl/renderer/animationLoop.js";
import {
	clearDynamicBufferCache,
	updateDynamicBuffers
} from "../src/core/webgl/renderer/lifecycle/dynamicBufferUpdater.js";
import {
	createFrameScheduler,
	createGlDouble
} from "./nativeRendererDoubles.mjs";

test("renderer loop starts once, renders in order, and cancels the pending frame", () => {
	const scheduler = createFrameScheduler();
	const events = [];
	let clock = 1000;
	const renderer = createLoopRenderer(scheduler, events, function clockNow() {
		clock += 16;
		return clock;
	});
	assert.equal(startRendererLoop(renderer), true);
	assert.equal(startRendererLoop(renderer), false);
	const firstFrame = scheduler.pending()[0];
	scheduler.fire(firstFrame);
	assert.equal(renderer.frameCount, 1);
	assert.deepEqual(events, ["resize", "update", "shape", "draw"]);
	const secondFrame = scheduler.pending()[0];
	assert.equal(stopRendererLoop(renderer), true);
	assert.deepEqual(scheduler.cancelled, [secondFrame]);
	assert.equal(stopRendererLoop(renderer), false);
});

test("dynamic upload caches remain isolated between renderer instances", () => {
	const glA = createGlDouble();
	const glB = createGlDouble();
	const rendererA = createDynamicRenderer(glA);
	const rendererB = createDynamicRenderer(glB);
	updateDynamicBuffers(rendererA);
	updateDynamicBuffers(rendererB);
	const firstA = glA.uploads[0].data.buffer;
	const firstB = glB.uploads[0].data.buffer;
	assert.notEqual(firstA, firstB);
	clearDynamicBufferCache(rendererA);
	rendererB.rootAnimatedObjects[0].dirty = true;
	updateDynamicBuffers(rendererB);
	const secondB = glB.uploads[1].data.buffer;
	assert.equal(secondB, firstB);
});

function createLoopRenderer(scheduler, events, clockNow) {
	return {
		options: {
			requestAnimationFrame(callback) {
				return scheduler.request(callback);
			},
			cancelAnimationFrame(id) {
				scheduler.cancel(id);
			},
			performanceNow: clockNow
		},
		running: false,
		destroyed: false,
		animationFrame: null,
		frameCount: 0,
		lastFrameTime: 0,
		rootAnimatedObjects: [],
		cameraAnimation: [],
		isPlaying: false,
		isCameraAnimationEnabled: true,
		systemManager: {
			shapeKeySystem: {
				update() {
					events.push("shape");
				}
			}
		},
		drawingManager: {
			renderFrame() {
				events.push("draw");
			}
		},
		resize() {
			events.push("resize");
		},
		update() {
			events.push("update");
		}
	};
}

function createDynamicRenderer(gl) {
	return {
		gl,
		rootAnimatedObjects: [{
			id: "same-id",
			dirty: true,
			positions: [0, 0, 0],
			buffers: { isDynamic: true, position: {} },
			children: []
		}]
	};
}
