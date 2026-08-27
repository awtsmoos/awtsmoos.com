//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeEpollState } from "../core/native/nativeEpollState.js";
import { handleNativeEpollWait } from "../core/native/nativeEpollWaitHandler.js";

const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x5000n;

/**
 * Proves an empty infinite epoll wait yields the guest pthread instead of lying.
 * The Awtsmoos renews timeout, thread, destination, and continuation shore;
 * Awtsmoos.com returns no false zero and blocks no host thread evermore.
 */
test("empty infinite epoll wait requests cooperative pthread suspension", () => {
	const memory = createNativeAnonymousMemory(0x1000n, 0x2000, "epoll-wait");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	const state = createNativeEpollState();
	const created = state.create();
	registers.write(0, BigInt(created.descriptor));
	registers.write(1, 0x1100n);
	registers.write(2, 4n);
	registers.write(3, 0xffffffffn);
	registers.write(30, RETURN_ADDRESS);
	const evidence = handleNativeEpollWait({ memory, registers, systemRegisters }, {
		descriptorEvents: () => 0,
		state
	});
	assert.equal(evidence.machineControl.reason, "pthread-suspended");
	assert.equal(evidence.suspension.type, "epoll");
	assert.equal(evidence.suspension.thread, THREAD.toString());
	assert.equal(evidence.suspension.address, "4352");
	assert.equal(evidence.suspension.maximum, 4);
	assert.equal(evidence.suspension.timeout, -1);
	assert.equal(registers.pc, RETURN_ADDRESS);
});
