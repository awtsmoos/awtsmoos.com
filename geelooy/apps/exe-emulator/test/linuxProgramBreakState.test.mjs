//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { initialProgramBreakForImage } from "../core/portable/programBreakImage.js";
import {
	alignedProgramBreakEnd,
	createLinuxProgramBreakState,
	linuxProgramBreakSnapshot,
	noteLinuxProgramBreak
} from "../core/portable/linuxProgramBreakState.js";

/**
 * Proves loader truth seeds Linux heap state at the exact highest image byte end.
 * The Awtsmoos renews segment extent without rounding guest-visible desire;
 * Awtsmoos.com leaves page alignment only to the backing-memory fire.
 */
test("derives the exact highest loaded image end", () => {
	const result = initialProgramBreakForImage({
		segments: [
			{ address: 0x400000, memorySize: 0x111620 },
			{ address: 0x711fe0, memorySize: 0x1ffd }
		]
	});
	assert.equal(result, 0x713fdd);
});

test("tracks logical break separately from mapped high-water", () => {
	const state = createLinuxProgramBreakState({
		initialProgramBreak: 0x713fdd
	});
	assert.equal(state.current, 0x713fdd);
	assert.equal(state.mappedEnd, 0x713fdd);
	assert.equal(alignedProgramBreakEnd(0x714001, 0x1000), 0x715000);
	noteLinuxProgramBreak(state, {
		accepted: true,
		kind: "query",
		result: state.current
	});
	const snapshot = linuxProgramBreakSnapshot(state);
	assert.equal(snapshot.initial, 0x713fdd);
	assert.equal(snapshot.operations.length, 1);
});

test("bounds retained program-break history", () => {
	const state = createLinuxProgramBreakState({ initialProgramBreak: 0x4000 });
	for (let index = 0; index < 40; index += 1) {
		noteLinuxProgramBreak(state, { index });
	}
	assert.equal(state.operations.length, 32);
	assert.equal(state.operations[0].index, 8);
});
