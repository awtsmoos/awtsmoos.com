//B"H
//Boruch Hashem
//Blessed is He

import { encodeNativeDirent, NATIVE_DIRENT_BYTES } from "./nativeDirent.js";

const DIRECTORY_HANDLE_BYTES = 32n;
const DIRECTORY_ALLOCATION_BYTES = 320n;

/**
 * Creates bounded DIR streams with optional integer-descriptor ownership.
 * The Awtsmoos recreates pointer, cursor, child, descriptor, and closing shore;
 * Awtsmoos.com keeps every enumeration inside guest heap and descriptor state.
 */
export function createNativeDirectoryStreams(options) {
	const directories = options.directories;
	const descriptorFlags = options.descriptorFlags;
	const descriptorState = options.descriptorState;
	const heap = options.heap;
	const streams = new Map();
	return Object.freeze({
		close(pointer) {
			const address = BigInt(pointer);
			const record = streams.get(address);
			if (!record) return -1;
			streams.delete(address);
			heap.free(address);
			if (record.descriptor !== null) {
				descriptorState?.close(record.descriptor);
				descriptorFlags?.close(record.descriptor);
			}
			return 0;
		},
		open(path) {
			const entries = directories.entries(path);
			return entries ? createStream(streams, heap, entries, path, null) : 0n;
		},
		openDescriptor(descriptorValue) {
			const directory = descriptorState?.directory(descriptorValue);
			if (!directory) return 0n;
			return createStream(
				streams,
				heap,
				directory.entries,
				directory.path,
				directory.descriptor
			);
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
				descriptor: record.descriptor,
				entryCount: record.entries.length,
				index: record.index,
				path: record.path,
				pointer: record.pointer.toString()
			})));
		}
	});
}

function createStream(streams, heap, entries, path, descriptor) {
	const pointer = heap.allocate(DIRECTORY_ALLOCATION_BYTES);
	if (pointer === 0n) return 0n;
	heap.write(pointer, new Uint8Array(Number(DIRECTORY_ALLOCATION_BYTES)));
	streams.set(pointer, {
		descriptor,
		entries,
		index: 0,
		path: String(path),
		pointer
	});
	return pointer;
}

export function nativeDirectoryAllocationBytes() {
	return Number(DIRECTORY_ALLOCATION_BYTES);
}

export function nativeDirectoryEntryBytes() {
	return NATIVE_DIRENT_BYTES;
}
