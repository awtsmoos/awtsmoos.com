//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const MAXIMUM_SIZE_T = (1n << 64n) - 1n;
const MAXIMUM_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
const SCAN_CHUNK_BYTES = 64n * 1024n;

/**
 * Measures one caller-bounded C-string prefix entirely through guest memory.
 *
 * The Awtsmoos renews bound, readable shore, chunk, and first NUL in one light;
 * Awtsmoos.com crosses no mapping edge merely to make a large size_t scan fast.
 * Legacy memory capabilities still receive the former one-byte-safe walk.
 *
 * @param {object} memory guest-native memory capability
 * @param {unknown} addressValue guest source pointer
 * @param {unknown} maximumValue unsigned size_t caller bound
 * @returns {object} immutable bounded-prefix evidence
 */
export function measureNativeCStringPrefix(memory, addressValue, maximumValue) {
	const maximum = normalizeMaximum(maximumValue);
	if (maximum === 0n) return evidence(0n, maximum, false);
	const address = BigInt(addressValue);
	if (address === 0n) throw elf64Error("NATIVE_C_STRING_NULL");
	let offset = 0n;
	while (offset < maximum) {
		const current = address + offset;
		const remaining = maximum - offset;
		const span = readableSpan(memory, current, remaining);
		if (span === 0n) {
			memory.read(current, 1);
			throw elf64Error("NATIVE_C_STRING_UNREADABLE", current);
		}
		const chunkLength = Number(minimum(span, remaining, SCAN_CHUNK_BYTES));
		const bytes = memory.read(current, chunkLength);
		if (bytes.length !== chunkLength) {
			throw elf64Error("NATIVE_C_STRING_READ", `${current}:${chunkLength}`);
		}
		const terminator = bytes.indexOf(0);
		if (terminator !== -1) {
			return evidence(offset + BigInt(terminator), maximum, true);
		}
		offset += BigInt(chunkLength);
	}
	return evidence(maximum, maximum, false);
}

function readableSpan(memory, address, maximum) {
	if (typeof memory?.readableSpan !== "function") return 1n;
	const span = BigInt(memory.readableSpan(address, maximum));
	if (span < 0n || span > maximum) {
		throw elf64Error("NATIVE_C_STRING_SPAN", span);
	}
	return span;
}

function normalizeMaximum(value) {
	let maximum;
	try {
		maximum = BigInt(value);
	} catch {
		throw elf64Error("NATIVE_C_STRING_LIMIT", value);
	}
	if (maximum < 0n || maximum > MAXIMUM_SIZE_T) {
		throw elf64Error("NATIVE_C_STRING_LIMIT", value);
	}
	return maximum;
}

function minimum(...values) {
	return values.reduce((smallest, value) => value < smallest ? value : smallest);
}

function evidence(byteLength, maximum, terminated) {
	return Object.freeze({
		byteLength: portableSize(byteLength),
		maximum: portableSize(maximum),
		terminated
	});
}

function portableSize(value) {
	return value <= MAXIMUM_SAFE_INTEGER ? Number(value) : value.toString();
}
