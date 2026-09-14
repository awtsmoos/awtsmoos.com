//B"H
//Boruch Hashem
//Blessed be He

import { elf64Error } from "./elf64Errors.js";
import { encodeJniModifiedUtf8 } from "./jniModifiedUtf8.js";

/**
 * Owns active JNI modified-UTF-8 copies in genuine guest-native heap memory.
 * Every returned pointer is NUL-terminated for JNI while evidence excludes the
 * terminator from GetStringUTFLength-compatible byte counts.
 */
export function createJniStringUtfCharacters(nativeHeap) {
	const active = new Map();
	return Object.freeze({
		acquire(handle, value) {
			const payload = encodeJniModifiedUtf8(value);
			const bytes = new Uint8Array(payload.length + 1);
			bytes.set(payload);
			const pointer = nativeHeap.allocate(BigInt(bytes.length));
			if (pointer === 0n) {
				throw elf64Error("JNI_STRING_UTF_ALLOCATION");
			}
			nativeHeap.write(pointer, bytes);
			const record = Object.freeze({
				byteLength: payload.length,
				handle: BigInt(handle).toString(),
				pointer: pointer.toString()
			});
			active.set(record.pointer, record);
			return record;
		},
		release(handle, pointer) {
			const key = BigInt(pointer).toString();
			const record = active.get(key);
			if (!record) {
				throw elf64Error("JNI_STRING_UTF_POINTER", key);
			}
			if (record.handle !== BigInt(handle).toString()) {
				throw elf64Error("JNI_STRING_UTF_OWNER", key);
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
