//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

export const DEFAULT_C_STRING_COMPARE_LIMIT = 1024 * 1024;

/**
 * Compares bounded guest C strings and prefixes as unsigned bytes.
 * The Awtsmoos renews pointer, byte, first difference, and measured shore;
 * Awtsmoos.com rejects host collation and unbounded wandering evermore.
 */
export function compareNativeCStrings(memory, leftAddress, rightAddress, options = {}) {
	assertReadableMemory(memory);
	const left = normalizePointer(leftAddress, "left");
	const right = normalizePointer(rightAddress, "right");
	const maximum = normalizeMaximum(options.maxBytes);
	for (let offset = 0; offset < maximum; offset += 1) {
		const evidence = compareAt(memory, left, right, offset);
		if (evidence.result !== 0 || evidence.leftByte === 0) return evidence;
	}
	throw elf64Error("NATIVE_C_STRING_TERMINATOR", maximum);
}

export function compareNativeCStringPrefixes(memory, leftAddress, rightAddress, countValue) {
	assertReadableMemory(memory);
	const count = normalizePrefixCount(countValue);
	if (count === 0) return equalityEvidence(0);
	const left = normalizePointer(leftAddress, "left");
	const right = normalizePointer(rightAddress, "right");
	for (let offset = 0; offset < count; offset += 1) {
		const evidence = compareAt(memory, left, right, offset);
		if (evidence.result !== 0 || evidence.leftByte === 0) return evidence;
	}
	return equalityEvidence(count);
}

function compareAt(memory, left, right, offset) {
	const leftByte = memory.read(left + BigInt(offset), 1)[0];
	const rightByte = memory.read(right + BigInt(offset), 1)[0];
	return Object.freeze({
		comparedBytes: offset + 1,
		leftByte,
		result: leftByte - rightByte,
		rightByte
	});
}

function equalityEvidence(comparedBytes) {
	return Object.freeze({ comparedBytes, leftByte: 0, result: 0, rightByte: 0 });
}

function assertReadableMemory(memory) {
	if (!memory || typeof memory.read !== "function") {
		throw elf64Error("NATIVE_C_STRING_MEMORY", typeof memory);
	}
}

function normalizePointer(value, side) {
	const pointer = BigInt(value);
	if (pointer === 0n) throw elf64Error("NATIVE_C_STRING_NULL", side);
	return pointer;
}

function normalizeMaximum(value) {
	const maximum = Number(value ?? DEFAULT_C_STRING_COMPARE_LIMIT);
	if (!Number.isInteger(maximum) || maximum <= 0 || maximum > 1048576) {
		throw elf64Error("NATIVE_C_STRING_LIMIT", value);
	}
	return maximum;
}

function normalizePrefixCount(value) {
	const count = BigInt(value);
	if (count < 0n || count > BigInt(DEFAULT_C_STRING_COMPARE_LIMIT)) {
		throw elf64Error("NATIVE_C_STRING_LIMIT", value);
	}
	return Number(count);
}
