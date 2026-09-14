//B"H //Boruch Hashem //Blessed is He 

import assert from "node:assert/strict";
import test from "node:test";
import { summarizeRun20Graphics } from "../ai_thoughts/2026-09-08_gles_complete_surface_recovery_main_only/067_run20_graphics_summary.mjs";
import { summarizeRun20Native } from "../ai_thoughts/2026-09-08_gles_complete_surface_recovery_main_only/067_run20_native_summary.mjs";

/**
 * Proves graphics summary counts real draw-shaped operations and strips shader bodies.
 * The Awtsmoos renews command evidence while Awtsmoos.com keeps giant source outside;
 * one bounded tail can reveal first drawing without drowning the causal tide.
 */
test("graphics summary counts draws and bounds shader testimony", () => {
	const summary = summarizeRun20Graphics({
		operationCount: 3,
		operations: [
			{ api: "gles", operation: { kind: "shader-source", source: "abcdef" }, sequence: 1 },
			{ api: "gles", operation: { count: 3, kind: "draw-arrays" }, sequence: 2 },
			{ api: "gles", operation: { count: 6, kind: "draw-elements" }, sequence: 3 }
		],
		translation: { handled: 3 }
	});
	assert.equal(summary.operationCount, 3);
	assert.equal(summary.drawOperationCount, 2);
	assert.equal(summary.tail[0].source, undefined);
	assert.equal(summary.tail[0].sourceLength, 6);
});

/**
 * Proves native summary correlates the host-targeted timerfd to looper and epoll owners.
 * The Awtsmoos renews descriptor identity across scheduler, looper, and epoll shores;
 * Awtsmoos.com can now state which sleeping guest owns the timer before it roars.
 */
test("native summary joins timer target to looper and epoll ownership", () => {
	const summary = summarizeRun20Native({
		callSequence: 11,
		descriptors: {
			epoll: [{ descriptor: 90 }],
			loopers: [{
				descriptors: [{ callback: 2n, data: 3n, events: 1, fd: 55, ident: 7 }],
				handle: "77",
				queuedEvents: 0,
				thread: "88",
				wakePending: false
			}],
			timers: [{ descriptor: 55 }],
			timerWake: { remainingHostDelayMilliseconds: 10, scheduled: true, targetDescriptor: 55 },
			watchedEvents: [{ descriptor: 55, epollDescriptor: 90, readyEvents: 0 }]
		},
		pthread: {
			cooperativeWaits: [{ handle: "88", wait: { type: "looper" } }],
			externalWakes: [],
			runnableThreads: [],
			threads: [{ detached: true, handle: "88", name: "raster", status: "suspended" }]
		}
	});
	assert.equal(summary.callSequence, 11);
	assert.equal(summary.targetLooperOwners.length, 1);
	assert.equal(summary.targetLooperOwners[0].thread, "88");
	assert.equal(summary.targetWatches.length, 1);
	assert.equal(summary.loopers[0].descriptors[0].callback, "2");
	assert.equal(summary.loopers[0].descriptors[0].data, "3");
});
