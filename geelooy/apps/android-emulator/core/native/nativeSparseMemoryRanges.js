//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { normalizeNativeMemoryRange } from "./nativeMemoryOwnership.js";

/**
 * Finds one PT_LOAD vessel containing an entire requested guest range.
 * The Awtsmoos renews segment edge and offset measure without overlap disguise;
 * Awtsmoos.com keeps sparse ELF truth exact before any byte may rise.
 */
export function locateSparseMemorySegment(segments, address, length) {
	const range = normalizeNativeMemoryRange(address, length);
	const segment = findSparseMemorySegment(segments, range);
	if (!segment) {
		throw elf64Error(
			"NATIVE_MEMORY_ADDRESS",
			`${range.start}:${range.size}`
		);
	}
	const offsetValue = range.start - segment.start;
	if (offsetValue > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw elf64Error("NATIVE_MEMORY_OFFSET", offsetValue);
	}
	return Object.freeze({
		offset: Number(offsetValue),
		segment
	});
}

/**
 * Answers ownership without performing a read or manufacturing a zero byte.
 */
export function sparseMemoryContains(segments, address, length = 1) {
	const range = normalizeNativeMemoryRange(address, length);
	return Boolean(findSparseMemorySegment(segments, range));
}

/**
 * Returns the readable distance remaining in the one owning PT_LOAD segment.
 */
export function sparseMemoryReadableSpan(segments, address, maximum) {
	const start = BigInt(address);
	const limit = BigInt(maximum);
	if (limit < 0n) {
		throw elf64Error("NATIVE_MEMORY_LENGTH", maximum);
	}
	if (limit === 0n) {
		return 0n;
	}
	const segment = segments.find(candidate => {
		return start >= candidate.start && start < candidate.end;
	});
	if (!segment) {
		return 0n;
	}
	const remaining = segment.end - start;
	if (remaining < limit) {
		return remaining;
	}
	return limit;
}

function findSparseMemorySegment(segments, range) {
	return segments.find(candidate => {
		return range.start >= candidate.start && range.end <= candidate.end;
	});
}
