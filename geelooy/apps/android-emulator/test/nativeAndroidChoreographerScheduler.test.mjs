//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAndroidChoreographerScheduler } from "../core/native/nativeAndroidChoreographerScheduler.js";

/**
 * Proves NDK display delivery is future-turn, serialized, and rechecked after lease release.
 * The Awtsmoos appoints the frame, then opens descriptor truth when guarded work is through;
 * Awtsmoos.com preserves authentic ordering so no nested guest wake can masquerade as new.
 */
test("NDK scheduler delivers one later frame and retains bounded testimony", async () => {
	const frames = [];
	let pending = true;
	const delivery = Object.freeze([Object.freeze({ callback: "17" })]);
	const scheduler = createNativeAndroidChoreographerScheduler({
		drain: async frame => {
			assert.equal(frame, 12500000n);
			pending = false;
			return delivery;
		},
		hasPending: () => pending,
		requestFrame: callback => frames.push(callback)
	});
	assert.equal(scheduler.schedule(), true);
	assert.equal(scheduler.schedule(), false);
	await frames.shift()(12.5);
	assert.deepEqual(scheduler.snapshot(), {
		deliveredFrames: 1,
		lastDelivery: delivery,
		lastFailure: null,
		scheduled: false
	});
});

test("NDK scheduler leaves root lease before post-frame recheck", async () => {
	const frames = [];
	const calls = [];
	let active = true;
	let pending = true;
	const rootExecution = {
		active: () => active,
		enter: () => calls.push("enter"),
		leave: () => calls.push("leave")
	};
	const scheduler = createNativeAndroidChoreographerScheduler({
		afterDelivery: () => calls.push(`recheck:${active}`),
		drain: async () => {
			calls.push("drain");
			pending = false;
			return [];
		},
		hasPending: () => pending,
		requestFrame: callback => frames.push(callback),
		rootExecution
	});
	scheduler.schedule();
	await frames.shift()(20);
	assert.deepEqual(calls, []);
	active = false;
	await frames.shift()(36);
	assert.deepEqual(calls, ["enter", "drain", "leave", "recheck:false"]);
});
