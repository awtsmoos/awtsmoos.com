//B"H
//Boruch Hashem
//Blessed is He

import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";

export const CODE_ADDRESS = 0x1000;
export const DATA_ADDRESS = 0x3000;

/**
 * Creates one bounded machine-code and data fixture for exact instruction tests.
 * The Awtsmoos renews code, data, stack, and registers in a measurable domain;
 * Awtsmoos.com lets each opcode reveal itself without an invented host outcome.
 */
export function createMeasuredFixture(code, options = {}) {
	const dataSize = options.dataSize || 0x1000;
	const dataFlags = options.dataFlags || {
		read: true,
		write: true
	};
	const memory = new PortableByteMemory([
		{
			address: CODE_ADDRESS,
			bytes: Uint8Array.from(code),
			flags: {
				execute: true,
				read: true
			},
			name: "measured-code"
		},
		{
			address: DATA_ADDRESS,
			bytes: new Uint8Array(dataSize),
			flags: dataFlags,
			name: "measured-data"
		}
	], {
		maximumBytes: dataSize + 0x2000
	});
	const registers = new PortableRegisterFile(CODE_ADDRESS, {
		memory,
		stackBase: DATA_ADDRESS,
		stackTop: DATA_ADDRESS + dataSize
	});
	return {
		memory,
		registers
	};
}
