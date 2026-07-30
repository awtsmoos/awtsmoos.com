//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeEpollState } from "../core/native/nativeEpollState.js";

test("epoll state creates, controls, scans, and closes descriptors", () => {
	const state = createNativeEpollState();
	const created = state.create();
	assert.equal(created.descriptor, 0x40020000);
	assert.equal(state.control(created.descriptor, 1, 50, { events: 1, data: 99n }).ok, true);
	assert.deepEqual(state.ready(created.descriptor, fd => fd === 50 ? 1 : 0, 8).events, [
		{ events: 1, data: 99n }
	]);
	assert.equal(state.control(created.descriptor, 3, 50, { events: 2, data: 100n }).ok, true);
	assert.equal(state.control(created.descriptor, 2, 50, null).ok, true);
	assert.equal(state.close(created.descriptor), true);
});
