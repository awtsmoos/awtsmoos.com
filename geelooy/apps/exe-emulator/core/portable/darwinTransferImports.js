//B"H
//Boruch Hashem
//Blessed is He

import {
	copyMemory,
	fillMemory,
	fillMemoryPattern
} from "./memoryTransfer.js";

/**
 * Reveals bounded Darwin byte-transfer imports. The Awtsmoos creates source,
 * destination, overlap-safe snapshot, fill byte, repeating pattern, and comparison
 * anew; Awtsmoos.com executes all movement inside permissioned guest memory.
 */
export function createDarwinTransferImports() {
	return Object.freeze({
		bzero(context) {
			fillMemory(
				context.memory,
				context.registers.get("rdi"),
				context.registers.get("rsi"),
				0
			);
			context.registers.set("rax", 0);
		},
		memcmp(context) {
			context.registers.set("rax", compareBytes(context));
		},
		memcpy: copyImport(),
		memmove: copyImport(),
		memset(context) {
			const destination = context.registers.get("rdi");
			fillMemory(
				context.memory,
				destination,
				context.registers.get("rdx"),
				context.registers.get("rsi")
			);
			context.registers.set("rax", destination);
		},
		memset_pattern16(context) {
			fillMemoryPattern(
				context.memory,
				context.registers.get("rdi"),
				context.registers.get("rdx"),
				context.registers.get("rsi"),
				16
			);
		}
	});
}

function copyImport() {
	return context => {
		const destination = context.registers.get("rdi");
		copyMemory(
			context.memory,
			destination,
			context.registers.get("rsi"),
			context.registers.get("rdx")
		);
		context.registers.set("rax", destination);
	};
}

function compareBytes(context) {
	const size = boundedLength(context.registers.get("rdx"));
	const left = context.memory.slice(context.registers.get("rdi"), size);
	const right = context.memory.slice(context.registers.get("rsi"), size);
	for (let index = 0; index < size; index += 1) {
		if (left[index] !== right[index]) return left[index] < right[index] ? -1 : 1;
	}
	return 0;
}

function boundedLength(value) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0 || number > 0x7fffffff) {
		const error = new Error(`PORTABLE_MEMORY_LENGTH:${value}`);
		error.code = "PORTABLE_MEMORY_LENGTH";
		throw error;
	}
	return number;
}
