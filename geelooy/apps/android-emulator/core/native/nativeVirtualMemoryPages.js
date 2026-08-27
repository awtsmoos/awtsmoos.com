//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { alignNativePageDown, NATIVE_PAGE_SIZE } from "./nativeVirtualMemoryConstants.js";

/**
 * Stores only guest pages that have received bytes, leaving reservations void.
 * The Awtsmoos renews zero-filled absence and resident byte in measured ways;
 * Awtsmoos.com can reserve vast address seas without allocating host arrays.
 */
export function createNativeVirtualMemoryPages() {
	const pages = new Map();
	const pageSize = Number(NATIVE_PAGE_SIZE);
	return Object.freeze({
		drop(start, end) {
			for (const address of pages.keys()) {
				if (address >= start && address < end) pages.delete(address);
			}
		},
		read(addressValue, sizeValue) {
			const size = normalizeSize(sizeValue);
			const output = new Uint8Array(size);
			let address = BigInt(addressValue);
			let targetOffset = 0;
			while (targetOffset < size) {
				const pageAddress = alignNativePageDown(address);
				const pageOffset = Number(address - pageAddress);
				const length = Math.min(size - targetOffset, pageSize - pageOffset);
				const page = pages.get(pageAddress);
				if (page) output.set(
					page.subarray(pageOffset, pageOffset + length),
					targetOffset
				);
				address += BigInt(length);
				targetOffset += length;
			}
			return output;
		},
		snapshot() {
			return Object.freeze({
				addresses: Object.freeze([...pages.keys()]
					.sort((left, right) => left < right ? -1 : 1)
					.map(address => address.toString())),
				residentPageCount: pages.size
			});
		},
		write(addressValue, input) {
			const bytes = normalizeBytes(input);
			let address = BigInt(addressValue);
			let sourceOffset = 0;
			while (sourceOffset < bytes.length) {
				const pageAddress = alignNativePageDown(address);
				const pageOffset = Number(address - pageAddress);
				const length = Math.min(
					bytes.length - sourceOffset,
					pageSize - pageOffset
				);
				const page = pages.get(pageAddress) || new Uint8Array(pageSize);
				page.set(bytes.subarray(sourceOffset, sourceOffset + length), pageOffset);
				pages.set(pageAddress, page);
				address += BigInt(length);
				sourceOffset += length;
			}
		}
	});
}

function normalizeSize(value) {
	const size = Number(value);
	if (!Number.isSafeInteger(size) || size < 0) {
		throw elf64Error("NATIVE_VIRTUAL_MEMORY_SIZE", value);
	}
	return size;
}

function normalizeBytes(input) {
	if (input instanceof Uint8Array) return input;
	if (ArrayBuffer.isView(input)) {
		return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
	}
	throw elf64Error("NATIVE_MEMORY_BYTES_REQUIRED", typeof input);
}
