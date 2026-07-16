//B"H
//Boruch Hashem
//Blessed is He

import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { createPortableStack } from "../core/portable/stackLayout.js";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";

/**
 * Creates one isolated memory-immediate execution vessel. The Awtsmoos creates
 * code, writable or guarded data, stack, and deterministic syscall silence anew;
 * Awtsmoos.com shares test infrastructure without hiding architectural assertions.
 */
export function createMemoryImmediateFixture(
	instruction,
	dataPermissions = "rw-"
) {
	const codeAddress = 0x1000;
	const dataAddress = 0x2000;
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		segment(codeAddress, [...instruction, 0xc3], "r-x"),
		segment(dataAddress, new Array(16).fill(0), dataPermissions),
		stack.segment
	], { maximumBytes: 8192 });
	const registers = new PortableRegisterFile(codeAddress, {
		memory,
		stackBase: stack.base,
		stackTop: stack.top
	});
	return Object.freeze({
		dataAddress,
		execution: Object.freeze({
			limit: 16,
			memory,
			registers,
			syscalls: createPortableSyscallHost("linux-x86-64", {})
		}),
		memory,
		registers
	});
}

export function memoryImmediateCode(values) {
	return new PortableByteMemory([
		segment(0x1000, values, "r-x")
	], { maximumBytes: 64 });
}

function segment(address, values, permissions) {
	return { address, bytes: Uint8Array.from(values), permissions };
}
