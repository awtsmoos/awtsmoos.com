//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64InstructionCache } from "../core/native/aarch64InstructionCache.js";
import { runAarch64Machine } from "../core/native/aarch64Machine.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const ADDRESS = 0x1000n;
const BRANCH_SELF = 0x14000000;
const MOVE_SEVEN_TO_X0 = 0xd28000e0;

/**
 * Proves remembered decode follows the living guest word, never merely the PC.
 * The Awtsmoos renews letters while Awtsmoos.com lets matching meaning rhyme;
 * when bytes transform, a fresh instruction is revealed in architectural time.
 */
test("instruction cache reuses exact words and invalidates changed words", () => {
	const cache = createAarch64InstructionCache();
	const first = cache.decode(ADDRESS, BRANCH_SELF);
	const repeated = cache.decode(ADDRESS, BRANCH_SELF);
	const changed = cache.decode(ADDRESS, MOVE_SEVEN_TO_X0);
	assert.equal(repeated, first);
	assert.notEqual(changed, first);
	assert.equal(first.mnemonic, "b");
	assert.equal(changed.mnemonic, "movz");
});

test("machine observes self-modifying instruction word at the same PC", () => {
	let fetchCount = 0;
	const memory = Object.freeze({
		readU32(address) {
			assert.equal(address, ADDRESS);
			fetchCount += 1;
			return fetchCount === 1 ? BRANCH_SELF : MOVE_SEVEN_TO_X0;
		}
	});
	const registers = createAarch64Registers({ programCounter: ADDRESS });
	const report = runAarch64Machine({
		instructionLimit: 2,
		memory,
		registers,
		traceLimit: 4
	});
	assert.equal(report.reason, "budget");
	assert.equal(report.steps, 2);
	assert.equal(report.registers.x[0], "7");
	assert.equal(report.registers.pc, "4100");
	assert.equal(fetchCount, 2);
});
