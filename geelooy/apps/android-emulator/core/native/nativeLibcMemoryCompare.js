//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Compares exact bounded guest byte ranges without host pointers or text rules.
 * The Awtsmoos recreates both snapshots, first difference, and signed W0 verdict;
 * Awtsmoos.com leaves memory untouched and resumes only after proven comparison.
 */
export function handleNativeMemcmp(context, maximumCount) {
	const registers = context.registers;
	const left = registers.read(0, 64, "zero");
	const right = registers.read(1, 64, "zero");
	const count = registers.read(2, 64, "zero");
	const length = normalizeCount(count, maximumCount);
	let comparedBytes = 0;
	let firstDifferenceIndex = -1;
	let result = 0;
	if (length > 0) {
		const memory = requireReadableMemory(context.memory);
		const leftBytes = Uint8Array.from(memory.read(left, length));
		const rightBytes = Uint8Array.from(memory.read(right, length));
		const comparison = compareBytes(leftBytes, rightBytes);
		comparedBytes = comparison.comparedBytes;
		firstDifferenceIndex = comparison.firstDifferenceIndex;
		result = comparison.result;
	}
	registers.write(0, BigInt.asUintN(32, BigInt(result)), 32, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		comparedBytes,
		count: count.toString(),
		firstDifferenceIndex,
		left: left.toString(),
		operation: "memcmp",
		result,
		right: right.toString()
	});
}

function compareBytes(leftBytes, rightBytes) {
	for (let index = 0; index < leftBytes.length; index += 1) {
		if (leftBytes[index] !== rightBytes[index]) {
			return Object.freeze({
				comparedBytes: index + 1,
				firstDifferenceIndex: index,
				result: leftBytes[index] - rightBytes[index]
			});
		}
	}
	return Object.freeze({
		comparedBytes: leftBytes.length,
		firstDifferenceIndex: -1,
		result: 0
	});
}

function normalizeCount(value, maximumCount) {
	const count = BigInt(value);
	if (count > BigInt(maximumCount)) {
		throw elf64Error("NATIVE_LIBC_BYTE_COUNT", count.toString());
	}
	return Number(count);
}

function requireReadableMemory(memory) {
	if (!memory || typeof memory.read !== "function") {
		throw elf64Error("NATIVE_LIBC_READ_MEMORY", typeof memory);
	}
	return memory;
}
