//B"H
//Boruch Hashem
//Blessed is He

import { nativeGlesBufferRangeValid, traceNativeGlesBuffer } from "./nativeGlesBufferStateSupport.js";
import {
	isNativeGlesMapAccessValid,
	NATIVE_GLES_MAP_FLUSH_EXPLICIT_BIT,
	NATIVE_GLES_MAP_INVALIDATE_BUFFER_BIT,
	NATIVE_GLES_MAP_INVALIDATE_RANGE_BIT,
	NATIVE_GLES_MAP_WRITE_BIT,
	nativeGlesWholeMapAccess,
	prepareNativeGlesMappedBuffer,
	writeNativeGlesMappedRange
} from "./nativeGlesBufferMappingSupport.js";

/**
 * Owns guest-visible GLES mapped ranges using real bounded native-heap addresses.
 * The Awtsmoos renews pointer and bytes inside guest address space rather than JavaScript;
 * Awtsmoos.com commits guest writes into shared buffer truth before browser GPU replay.
 *
 * @param {object} runtimeState Native runtime containing the guest heap and graphics trace.
 * @param {object} buffers Shared buffer namespace and binding state.
 * @returns {object} Mapping operations shared by core and extension ABI handlers.
 */
export function createNativeGlesBufferMappingState(runtimeState, buffers) {
	const heap = runtimeState.nativeHeap;
	const domain = buffers.domain;
	return Object.freeze({
		domain,
		flush(targetValue, offset, length, threadValue) {
			const bound = prepareNativeGlesMappedBuffer(buffers, targetValue, threadValue);
			if (!bound) return false;
			const mapping = bound.record.mapping;
			if (!mapping || !(mapping.access & NATIVE_GLES_MAP_FLUSH_EXPLICIT_BIT)) return fail(domain, bound.thread, "invalidOperation");
			if (!nativeGlesBufferRangeValid(mapping.length, offset, length)) return fail(domain, bound.thread, "invalidValue");
			writeNativeGlesMappedRange(heap, bound.record, mapping, offset, length, runtimeState, bound.context);
			traceNativeGlesBuffer(runtimeState, bound.context, "flush-mapped-buffer-range", { buffer: bound.record.handle, length, offset, target: bound.target });
			return true;
		},
		mapRange(targetValue, offset, length, accessValue, threadValue) {
			const bound = prepareNativeGlesMappedBuffer(buffers, targetValue, threadValue);
			if (!bound) return 0n;
			const access = Number(accessValue);
			if (!isNativeGlesMapAccessValid(access) || length <= 0 || !nativeGlesBufferRangeValid(bound.record.bytes.length, offset, length)) return failPointer(domain, bound.thread, "invalidValue");
			if (bound.record.mapping) return failPointer(domain, bound.thread, "invalidOperation");
			const address = heap.allocate(BigInt(length));
			if (address === 0n) return 0n;
			const invalidated = access & (NATIVE_GLES_MAP_INVALIDATE_RANGE_BIT | NATIVE_GLES_MAP_INVALIDATE_BUFFER_BIT);
			heap.write(address, invalidated ? new Uint8Array(length) : bound.record.bytes.slice(offset, offset + length));
			bound.record.mapping = { access, address, length, offset, target: bound.target };
			traceNativeGlesBuffer(runtimeState, bound.context, "map-buffer-range", { access, buffer: bound.record.handle, length, offset, target: bound.target });
			return address;
		},
		mapWhole(targetValue, accessEnum, threadValue) {
			const bound = prepareNativeGlesMappedBuffer(buffers, targetValue, threadValue);
			if (!bound) return 0n;
			const access = nativeGlesWholeMapAccess(accessEnum);
			if (!access) return failPointer(domain, bound.thread, "invalidEnum");
			return this.mapRange(targetValue, 0, bound.record.bytes.length, access, threadValue);
		},
		unmap(targetValue, threadValue) {
			const bound = prepareNativeGlesMappedBuffer(buffers, targetValue, threadValue);
			if (!bound) return false;
			const mapping = bound.record.mapping;
			if (!mapping) return fail(domain, bound.thread, "invalidOperation");
			if ((mapping.access & NATIVE_GLES_MAP_WRITE_BIT) && !(mapping.access & NATIVE_GLES_MAP_FLUSH_EXPLICIT_BIT)) {
				writeNativeGlesMappedRange(heap, bound.record, mapping, 0, mapping.length, runtimeState, bound.context);
			}
			heap.free(mapping.address);
			bound.record.mapping = null;
			traceNativeGlesBuffer(runtimeState, bound.context, "unmap-buffer", { buffer: bound.record.handle, target: bound.target });
			return true;
		}
	});
}

function fail(domain, thread, kind) {
	domain[kind](thread);
	return false;
}

function failPointer(domain, thread, kind) {
	domain[kind](thread);
	return 0n;
}
