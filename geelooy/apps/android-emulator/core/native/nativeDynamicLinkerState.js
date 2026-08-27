//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const MAX_ERROR_BYTES = 4096;

/**
 * Creates a per-thread guest-owned dynamic-linker error channel.
 * The Awtsmoos recreates text, pointer, pending state, and thread shore anew;
 * Awtsmoos.com requires guest heap only when persistent text must be allocated.
 */
export function createNativeDynamicLinkerState(heap = null) {
	const records = new Map();
	return Object.freeze({
		clear(thread) {
			const record = records.get(normalizeThread(thread));
			if (!record) return false;
			record.pending = false;
			return true;
		},
		peek(thread) {
			const record = records.get(normalizeThread(thread));
			return record?.pending ? record.pointer : 0n;
		},
		set(thread, message) {
			validateHeap(heap);
			const key = normalizeThread(thread);
			const text = normalizeMessage(message);
			const bytes = encodeCString(text);
			const pointer = heap.allocate(BigInt(bytes.length));
			if (pointer === 0n) {
				throw elf64Error("NATIVE_DYNAMIC_LINKER_ERROR_ALLOCATION", bytes.length);
			}
			heap.write(pointer, bytes);
			const prior = records.get(key);
			if (prior) heap.free(prior.pointer);
			records.set(key, {
				byteLength: bytes.length - 1,
				pending: true,
				pointer,
				text,
				thread: key
			});
			return pointer;
		},
		snapshot() {
			return Object.freeze([...records.values()]
				.sort((left, right) => left.thread < right.thread ? -1 : 1)
				.map(record => Object.freeze({
					byteLength: record.byteLength,
					pending: record.pending,
					pointer: record.pointer.toString(),
					text: record.text,
					thread: record.thread.toString()
				})));
		},
		take(thread) {
			const record = records.get(normalizeThread(thread));
			if (!record?.pending) return 0n;
			record.pending = false;
			return record.pointer;
		}
	});
}

function encodeCString(text) {
	const encoded = new TextEncoder().encode(text);
	if (encoded.length > MAX_ERROR_BYTES) {
		throw elf64Error("NATIVE_DYNAMIC_LINKER_ERROR_LIMIT", encoded.length);
	}
	const bytes = new Uint8Array(encoded.length + 1);
	bytes.set(encoded);
	return bytes;
}

function normalizeMessage(value) {
	const text = String(value);
	if (!text || text.includes("\0")) {
		throw elf64Error("NATIVE_DYNAMIC_LINKER_ERROR_TEXT", text.length);
	}
	return text;
}

function normalizeThread(value) {
	return BigInt.asUintN(64, BigInt(value));
}

function validateHeap(heap) {
	if (!heap || typeof heap.allocate !== "function"
		|| typeof heap.free !== "function"
		|| typeof heap.write !== "function") {
		throw elf64Error("NATIVE_DYNAMIC_LINKER_ERROR_HEAP", typeof heap);
	}
}
