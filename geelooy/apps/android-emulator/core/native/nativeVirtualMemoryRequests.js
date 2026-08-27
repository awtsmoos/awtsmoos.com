//B"H
//Boruch Hashem
//Blessed is He

import {
	alignNativePageUp,
	NATIVE_MEMORY_MAP_FLAGS,
	NATIVE_MMAP_ERRNO,
	NATIVE_PAGE_SIZE,
	NATIVE_VIRTUAL_MEMORY_END,
	NATIVE_VIRTUAL_MEMORY_START
} from "./nativeVirtualMemoryConstants.js";

/**
 * Normalizes mmap-family arguments without borrowing host address semantics.
 * The Awtsmoos renews length, hint, flags, and offset before the mapping shore;
 * Awtsmoos.com rejects malformed guest covenants and fabricates nothing more.
 */
export function normalizeNativeMapRequest(input) {
	try {
		const address = BigInt(input.address);
		const requestedLength = BigInt(input.length);
		const protection = unsignedInt(input.protection);
		const flags = unsignedInt(input.flags);
		const fd = Number(BigInt.asIntN(32, BigInt(input.fd)));
		const offset = BigInt.asIntN(64, BigInt(input.offset));
		const length = requestedLength > 0n
			? alignNativePageUp(requestedLength)
			: 0n;
		const fixed = hasFlag(flags, NATIVE_MEMORY_MAP_FLAGS.fixed);
		const fixedNoReplace = hasFlag(
			flags,
			NATIVE_MEMORY_MAP_FLAGS.fixedNoReplace
		);
		if (!validMapShape({
			address,
			fixed: fixed || fixedNoReplace,
			flags,
			length,
			offset,
			protection
		})) {
			return nativeVirtualFailure(NATIVE_MMAP_ERRNO.EINVAL, "invalid-map");
		}
		if (length > NATIVE_VIRTUAL_MEMORY_END - NATIVE_VIRTUAL_MEMORY_START) {
			return nativeVirtualFailure(NATIVE_MMAP_ERRNO.ENOMEM, "map-too-large");
		}
		return Object.freeze({
			address,
			fd,
			fixed,
			fixedNoReplace,
			flags,
			length,
			offset,
			ok: true,
			protection,
			requestedLength
		});
	} catch {
		return nativeVirtualFailure(NATIVE_MMAP_ERRNO.EINVAL, "invalid-map-value");
	}
}

export function normalizeNativePageRange(addressValue, lengthValue) {
	try {
		const address = BigInt(addressValue);
		const requestedLength = BigInt(lengthValue);
		const length = requestedLength > 0n
			? alignNativePageUp(requestedLength)
			: 0n;
		const end = address + length;
		if (address < NATIVE_VIRTUAL_MEMORY_START
			|| address % NATIVE_PAGE_SIZE !== 0n
			|| length === 0n
			|| end > NATIVE_VIRTUAL_MEMORY_END) {
			return nativeVirtualFailure(NATIVE_MMAP_ERRNO.EINVAL, "invalid-range");
		}
		return Object.freeze({ address, end, length, ok: true, requestedLength });
	} catch {
		return nativeVirtualFailure(NATIVE_MMAP_ERRNO.EINVAL, "invalid-range-value");
	}
}

export function nativeVirtualFailure(errno, reason) {
	return Object.freeze({ errno, ok: false, reason });
}

function validMapShape(request) {
	const sharing = request.flags & 0x3;
	return request.address >= 0n
		&& request.length > 0n
		&& (request.protection & ~0x7) === 0
		&& hasFlag(request.flags, NATIVE_MEMORY_MAP_FLAGS.anonymous)
		&& (sharing === NATIVE_MEMORY_MAP_FLAGS.private
			|| sharing === NATIVE_MEMORY_MAP_FLAGS.shared)
		&& request.offset === 0n
		&& (!request.fixed || request.address % NATIVE_PAGE_SIZE === 0n);
}

function hasFlag(value, flag) {
	return (value & flag) === flag;
}

function unsignedInt(value) {
	return Number(BigInt.asUintN(32, BigInt(value)));
}
