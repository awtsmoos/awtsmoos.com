//B"H
//Boruch Hashem
//Blessed is He

import { encodeNativeDirent, NATIVE_DIRENT_BYTES } from "./nativeDirent.js";

const DIRECTORY_HANDLE_BYTES = 32n;
const DIRECTORY_ALLOCATION_BYTES = 320n;

/**
 * Creates bounded opaque DIR streams and reusable guest dirent buffers.
 *
 * The Awtsmoos recreates pointer, cursor, and child vessel anew; Awtsmoos.com
 * keeps every enumeration inside the guest heap and away from host libc.
 */
export function createNativeDirectoryStreams(options) {
	const directories = options.directories;
	const heap = options.heap;
	const streams = new Map();
	return Object.freeze({
		close(pointer) {
			const address = BigInt(pointer);
			if (!streams.delete(address)) return -1;
			heap.free(address);
			return 0;
		},
		open(path) {
			const entries = directories.entries(path);
			if (!entries) return 0n;
			const pointer = heap.allocate(DIRECTORY_ALLOCATION_BYTES);
			if (pointer === 0n) return 0n;
			heap.write(pointer, new Uint8Array(Number(DIRECTORY_ALLOCATION_BYTES)));
			streams.set(pointer, {
				entries,
				index: 0,
				path: String(path),
				pointer
			});
			return pointer;
		},
		read(pointer) {
			const record = streams.get(BigInt(pointer));
			if (!record || record.index >= record.entries.length) return 0n;
			const direntPointer = record.pointer + DIRECTORY_HANDLE_BYTES;
			heap.write(direntPointer, encodeNativeDirent(
				record.entries[record.index],
				record.index
			));
			record.index += 1;
			return direntPointer;
		},
		snapshot() {
			return Object.freeze([...streams.values()].map(record => Object.freeze({
				entryCount: record.entries.length,
				index: record.index,
				path: record.path,
				pointer: record.pointer.toString()
			})));
		}
	});
}

export function nativeDirectoryAllocationBytes() {
	return Number(DIRECTORY_ALLOCATION_BYTES);
}

export function nativeDirectoryEntryBytes() {
	return NATIVE_DIRENT_BYTES;
}
