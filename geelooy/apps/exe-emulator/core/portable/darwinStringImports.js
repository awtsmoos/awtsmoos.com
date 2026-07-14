//B"H
//Boruch Hashem
//Blessed is He

import { writeMemorySlice } from "./memoryTransfer.js";

const MAXIMUM_STRING_BYTES = 16 * 1024 * 1024;

/**
 * Reveals bounded Darwin C-string imports. The Awtsmoos creates terminator,
 * comparison, duplicate, and measured length anew; Awtsmoos.com scans only guest
 * memory and rejects strings that exceed the explicit process boundary.
 */
export function createDarwinStringImports() {
	return Object.freeze({
		strcmp(context) {
			context.registers.set("rax", compareStrings(context, MAXIMUM_STRING_BYTES));
		},
		strdup(context) {
			const source = context.registers.get("rdi");
			const length = stringLength(context.memory, source);
			const destination = context.heap.allocate(length + 1);
			writeMemorySlice(
				context.memory,
				destination,
				context.memory.slice(source, length + 1)
			);
			context.registers.set("rax", destination);
		},
		strlen(context) {
			context.registers.set(
				"rax",
				stringLength(context.memory, context.registers.get("rdi"))
			);
		},
		strncmp(context) {
			context.registers.set(
				"rax",
				compareStrings(context, boundedLimit(context.registers.get("rdx")))
			);
		}
	});
}

function compareStrings(context, limit) {
	const left = context.registers.get("rdi");
	const right = context.registers.get("rsi");
	for (let index = 0; index < limit; index += 1) {
		const leftByte = context.memory.u8(left + index);
		const rightByte = context.memory.u8(right + index);
		if (leftByte !== rightByte) return leftByte < rightByte ? -1 : 1;
		if (leftByte === 0) return 0;
	}
	return 0;
}

function stringLength(memory, address) {
	for (let length = 0; length < MAXIMUM_STRING_BYTES; length += 1) {
		if (memory.u8(address + length) === 0) return length;
	}
	throw stringError("PORTABLE_STRING_LIMIT", address);
}

function boundedLimit(value) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0) {
		throw stringError("PORTABLE_STRING_LENGTH", value);
	}
	return Math.min(number, MAXIMUM_STRING_BYTES);
}

function stringError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
