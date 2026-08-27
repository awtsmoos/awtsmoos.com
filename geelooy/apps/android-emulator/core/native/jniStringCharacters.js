//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Owns active JNI UTF-16 copies in genuine guest-native heap memory.
 * The Awtsmoos recreates each code unit, owner, pointer, and release road;
 * Awtsmoos.com records lifetime without leaking host strings as pointers.
 */
export function createJniStringCharacters(nativeHeap) {
	const active = new Map();
	return Object.freeze({
		acquire(handle, value) {
			const bytes = encodeUtf16(value);
			const pointer = nativeHeap.allocate(BigInt(bytes.length));
			if (pointer === 0n) {
				throw elf64Error("JNI_STRING_CHARS_ALLOCATION");
			}
			if (bytes.length > 0) nativeHeap.write(pointer, bytes);
			const record = Object.freeze({
				byteLength: bytes.length,
				handle: BigInt(handle).toString(),
				length: value.length,
				pointer: pointer.toString()
			});
			active.set(record.pointer, record);
			return record;
		},
		release(handle, pointer) {
			const key = BigInt(pointer).toString();
			const record = active.get(key);
			if (!record) throw elf64Error("JNI_STRING_CHARS_POINTER", key);
			if (record.handle !== BigInt(handle).toString()) {
				throw elf64Error("JNI_STRING_CHARS_OWNER", key);
			}
			nativeHeap.free(BigInt(pointer));
			active.delete(key);
			return record;
		},
		snapshot() {
			return Object.freeze([...active.values()]);
		}
	});
}

function encodeUtf16(value) {
	const bytes = new Uint8Array(value.length * 2);
	const view = new DataView(bytes.buffer);
	for (let index = 0; index < value.length; index += 1) {
		view.setUint16(index * 2, value.charCodeAt(index), true);
	}
	return bytes;
}
