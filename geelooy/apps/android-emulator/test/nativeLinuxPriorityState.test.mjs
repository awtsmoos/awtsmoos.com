//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createNativeLinuxPriorityState,
	PRIO_PGRP,
	PRIO_PROCESS,
	PRIO_USER
} from "../core/native/nativeLinuxPriorityState.js";

test("current process priority resolves to the calling guest tid", () => {
	const state = createNativeLinuxPriorityState();
	const result = state.set({ currentTid: 1004, requested: -5, which: PRIO_PROCESS, who: 0 });
	assert.deepEqual(result, {
		ok: true,
		record: { applied: -5, requested: -5, which: PRIO_PROCESS, who: 1004 }
	});
	assert.deepEqual(state.lookup(PRIO_PROCESS, 1004), result.record);
});

test("nice values clamp and all Linux priority subjects remain distinct", () => {
	const state = createNativeLinuxPriorityState();
	assert.equal(state.set({ currentTid: 1, requested: -99, which: PRIO_PROCESS, who: 7 }).record.applied, -20);
	assert.equal(state.set({ currentTid: 1, requested: 99, which: PRIO_PGRP, who: 8 }).record.applied, 19);
	assert.equal(state.set({ currentTid: 1, requested: 4, which: PRIO_USER, who: 9 }).record.applied, 4);
	assert.deepEqual(state.snapshot().map(item => item.which), [0, 1, 2]);
});

test("invalid which is rejected without state mutation", () => {
	const state = createNativeLinuxPriorityState();
	assert.deepEqual(state.set({ currentTid: 1, requested: 0, which: 9, who: 0 }), {
		error: "invalid-which",
		ok: false,
		which: 9
	});
	assert.deepEqual(state.snapshot(), []);
});
