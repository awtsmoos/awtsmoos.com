//B"H
//Boruch Hashem
//Blessed is He

import {
	alignNativePageDown,
	alignNativePageUp,
	NATIVE_MMAP_ERRNO,
	NATIVE_VIRTUAL_MEMORY_END,
	NATIVE_VIRTUAL_MEMORY_START
} from "./nativeVirtualMemoryConstants.js";
import {
	findNativeVirtualGap,
	nativeVirtualRangeCovered,
	nativeVirtualRangesOverlap,
	protectNativeVirtualRange,
	replaceNativeVirtualRange
} from "./nativeVirtualMemoryIntervals.js";
import {
	nativeVirtualFailure,
	normalizeNativeMapRequest,
	normalizeNativePageRange
} from "./nativeVirtualMemoryRequests.js";

/**
 * Owns mutable mapping records while exposing only immutable outcome evidence.
 * The Awtsmoos renews reservation, split, replacement, and release in one state;
 * Awtsmoos.com keeps persistent guest memory alive behind a frozen outer gate.
 */
export function createNativeVirtualMappingState(pages) {
	let records = Object.freeze([]);
	let nextAddress = NATIVE_VIRTUAL_MEMORY_START;
	let sequence = 0;
	return Object.freeze({
		map(input) {
			const request = normalizeNativeMapRequest(input);
			if (!request.ok) return request;
			const fixed = request.fixed || request.fixedNoReplace;
			const address = fixed
				? request.address
				: chooseAddress(records, request.address, request.length, nextAddress);
			if (address === null
				|| address < NATIVE_VIRTUAL_MEMORY_START
				|| address + request.length > NATIVE_VIRTUAL_MEMORY_END) {
				return nativeVirtualFailure(NATIVE_MMAP_ERRNO.ENOMEM, "address-space");
			}
			if (request.fixedNoReplace
				&& nativeVirtualRangesOverlap(records, address, address + request.length)) {
				return nativeVirtualFailure(NATIVE_MMAP_ERRNO.EEXIST, "fixed-overlap");
			}
			if (fixed) pages.drop(address, address + request.length);
			sequence += 1;
			const record = Object.freeze({
				end: address + request.length,
				fd: request.fd,
				flags: request.flags,
				id: sequence,
				offset: request.offset,
				protection: request.protection,
				start: address
			});
			records = replaceNativeVirtualRange(records, record.start, record.end, record);
			nextAddress = alignNativePageUp(record.end > nextAddress
				? record.end
				: nextAddress);
			return Object.freeze({ ...request, address, end: record.end, id: record.id });
		},
		protect(address, length, protectionValue) {
			const range = normalizeNativePageRange(address, length);
			const protection = Number(BigInt.asUintN(32, BigInt(protectionValue)));
			if (!range.ok || (protection & ~0x7) !== 0) {
				return nativeVirtualFailure(NATIVE_MMAP_ERRNO.EINVAL, "protect-range");
			}
			if (!nativeVirtualRangeCovered(records, range.address, range.end)) {
				return nativeVirtualFailure(NATIVE_MMAP_ERRNO.ENOMEM, "protect-unmapped");
			}
			records = protectNativeVirtualRange(
				records,
				range.address,
				range.end,
				protection
			);
			return Object.freeze({ ...range, ok: true, protection });
		},
		records() {
			return records;
		},
		snapshot() {
			return Object.freeze(records.map(record => Object.freeze({
				...record,
				end: record.end.toString(),
				offset: record.offset.toString(),
				start: record.start.toString()
			})));
		},
		unmap(address, length) {
			const range = normalizeNativePageRange(address, length);
			if (!range.ok) return range;
			records = replaceNativeVirtualRange(records, range.address, range.end);
			pages.drop(range.address, range.end);
			return Object.freeze({ ...range, ok: true });
		}
	});
}

function chooseAddress(records, hint, length, nextAddress) {
	const candidate = hint === 0n
		? nextAddress
		: alignNativePageDown(hint < NATIVE_VIRTUAL_MEMORY_START
			? NATIVE_VIRTUAL_MEMORY_START
			: hint);
	return findNativeVirtualGap(records, candidate, length, NATIVE_VIRTUAL_MEMORY_END)
		?? findNativeVirtualGap(
			records,
			NATIVE_VIRTUAL_MEMORY_START,
			length,
			NATIVE_VIRTUAL_MEMORY_END
		);
}
