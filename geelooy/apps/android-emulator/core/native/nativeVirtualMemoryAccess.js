//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import {
	NATIVE_MEMORY_PROTECTION,
	NATIVE_VIRTUAL_MEMORY_END,
	NATIVE_VIRTUAL_MEMORY_START
} from "./nativeVirtualMemoryConstants.js";
import { nativeVirtualRangeCovered } from "./nativeVirtualMemoryIntervals.js";

/**
 * Enforces mapping coverage and protection before sparse page access occurs.
 *
 * The Awtsmoos renews readable span, writable page, and forbidden shore;
 * Awtsmoos.com lets scanners see only contiguous protected guest territory.
 * Gaps and PROT_NONE remain hard boundaries before sparse page access begins.
 */
export function createNativeVirtualMemoryAccess(state, pages) {
	return Object.freeze({
		contains(address, size = 1) {
			const range = normalizeAccess(address, size);
			return range !== null && nativeVirtualRangeCovered(
				state.records(),
				range.start,
				range.end
			);
		},
		end: NATIVE_VIRTUAL_MEMORY_END,
		label: "native-virtual-memory",
		read(address, size) {
			const range = requireAccess(state, address, size, isReadable);
			return pages.read(range.start, Number(range.end - range.start));
		},
		readableSpan(address, maximum) {
			return measureReadableSpan(state.records(), address, maximum);
		},
		start: NATIVE_VIRTUAL_MEMORY_START,
		write(address, bytes) {
			const size = bytes?.byteLength;
			const range = requireAccess(state, address, size, record => {
				return (record.protection & NATIVE_MEMORY_PROTECTION.write) !== 0;
			});
			pages.write(range.start, bytes);
		}
	});
}

function measureReadableSpan(records, addressValue, maximumValue) {
	const start = BigInt(addressValue);
	const maximum = BigInt(maximumValue);
	if (maximum < 0n) throw elf64Error("NATIVE_VIRTUAL_MEMORY_SIZE", maximumValue);
	const limit = start + maximum;
	let cursor = start;
	for (const record of records) {
		if (cursor >= limit) break;
		if (record.end <= cursor) continue;
		if (record.start > cursor || !isReadable(record)) break;
		cursor = record.end < limit ? record.end : limit;
	}
	return cursor - start;
}

function isReadable(record) {
	return (record.protection & (
		NATIVE_MEMORY_PROTECTION.read
		| NATIVE_MEMORY_PROTECTION.execute
	)) !== 0;
}

function requireAccess(state, address, size, predicate) {
	const range = normalizeAccess(address, size);
	if (!range || !nativeVirtualRangeCovered(state.records(), range.start, range.end)) {
		throw elf64Error("NATIVE_VIRTUAL_MEMORY_ADDRESS", `${address}:${size}`);
	}
	if (!nativeVirtualRangeCovered(
		state.records(),
		range.start,
		range.end,
		predicate
	)) {
		throw elf64Error("NATIVE_VIRTUAL_MEMORY_PROTECTION", `${address}:${size}`);
	}
	return range;
}

function normalizeAccess(addressValue, sizeValue) {
	try {
		const start = BigInt(addressValue);
		const size = Number(sizeValue);
		if (!Number.isSafeInteger(size) || size < 0) return null;
		return Object.freeze({ end: start + BigInt(size), start });
	} catch {
		return null;
	}
}
