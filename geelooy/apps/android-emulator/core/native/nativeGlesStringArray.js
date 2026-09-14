//B"H
//Boruch Hashem
//Blessed be He

import { readNativeCString } from "./nativeCString.js";

const MAXIMUM_STRINGS = 256;
const MAXIMUM_STRING_BYTES = 64 * 1024;

/**
 * Reads a bounded AArch64 array of guest `const char*` pointers.
 * Every pointer stays in guest memory and each string is independently bounded,
 * so varying-name vectors cannot trigger unbounded or host-native memory access.
 */
export function readNativeGlesStringArray(memory, countValue, addressValue) {
	const count = Number(countValue);
	const address = BigInt(addressValue);
	if (!Number.isInteger(count) || count < 0 || count > MAXIMUM_STRINGS) {
		return Object.freeze({ strings: Object.freeze([]), success: false });
	}
	const strings = [];
	for (let index = 0; index < count; index += 1) {
		const bytes = memory.read(address + BigInt(index * 8), 8);
		const pointer = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
			.getBigUint64(0, true);
		if (pointer === 0n) {
			return Object.freeze({ strings: Object.freeze([]), success: false });
		}
		strings.push(readNativeCString(memory, pointer, {
			maxBytes: MAXIMUM_STRING_BYTES
		}).text);
	}
	return Object.freeze({ strings: Object.freeze(strings), success: true });
}
