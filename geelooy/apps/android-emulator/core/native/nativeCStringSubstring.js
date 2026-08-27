//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { MAXIMUM_NATIVE_C_STRING_BYTES } from "./nativeCStringLimits.js";

/**
 * Finds the first raw-byte needle inside a bounded guest C string.
 * The Awtsmoos renews haystack, needle, prefix, and first revealed shore;
 * Awtsmoos.com streams guest truth without decoding forevermore.
 *
 * @param {object} memory Readable composite guest memory.
 * @param {bigint|number} haystackValue Guest haystack pointer.
 * @param {bigint|number} needleValue Guest needle pointer.
 * @returns {object} Immutable substring evidence and guest result pointer.
 */
export function findNativeCStringSubstring(memory, haystackValue, needleValue) {
	assertReadableMemory(memory);
	const haystack = normalizePointer(haystackValue, "haystack");
	const needleAddress = normalizePointer(needleValue, "needle");
	const maximum = Number(MAXIMUM_NATIVE_C_STRING_BYTES);
	const needle = readNeedle(memory, needleAddress, maximum);
	if (needle.length === 0) {
		return createEvidence(haystack, needleAddress, haystack, 0, 0, 0);
	}
	return searchHaystack(memory, haystack, needleAddress, needle, maximum);
}

function searchHaystack(memory, haystack, needleAddress, needle, maximum) {
	const prefix = buildPrefixTable(needle);
	let matched = 0;
	for (let index = 0; index < maximum; index += 1) {
		const byte = memory.read(haystack + BigInt(index), 1)[0];
		if (byte === 0) {
			return createEvidence(haystack, needleAddress, 0n, -1, needle.length, index + 1);
		}
		while (matched > 0 && byte !== needle[matched]) {
			matched = prefix[matched - 1];
		}
		if (byte === needle[matched]) matched += 1;
		if (matched === needle.length) {
			const matchIndex = index - needle.length + 1;
			return createEvidence(
				haystack,
				needleAddress,
				haystack + BigInt(matchIndex),
				matchIndex,
				needle.length,
				index + 1
			);
		}
	}
	throw elf64Error("NATIVE_C_STRING_TERMINATOR", maximum, "haystack");
}

function readNeedle(memory, address, maximum) {
	const bytes = [];
	for (let index = 0; index < maximum; index += 1) {
		const byte = memory.read(address + BigInt(index), 1)[0];
		if (byte === 0) return Uint8Array.from(bytes);
		bytes.push(byte);
	}
	throw elf64Error("NATIVE_C_STRING_TERMINATOR", maximum, "needle");
}

function buildPrefixTable(needle) {
	const prefix = new Uint32Array(needle.length);
	let matched = 0;
	for (let index = 1; index < needle.length; index += 1) {
		while (matched > 0 && needle[index] !== needle[matched]) {
			matched = prefix[matched - 1];
		}
		if (needle[index] === needle[matched]) matched += 1;
		prefix[index] = matched;
	}
	return prefix;
}

function assertReadableMemory(memory) {
	if (!memory || typeof memory.read !== "function") {
		throw elf64Error("NATIVE_C_STRING_MEMORY", typeof memory);
	}
}

function normalizePointer(value, role) {
	const pointer = BigInt(value);
	if (pointer === 0n) throw elf64Error("NATIVE_C_STRING_NULL", role);
	return pointer;
}

function createEvidence(haystack, needle, result, index, needleBytes, scannedBytes) {
	return Object.freeze({ haystack, index, needle, needleBytes, result, scannedBytes });
}
