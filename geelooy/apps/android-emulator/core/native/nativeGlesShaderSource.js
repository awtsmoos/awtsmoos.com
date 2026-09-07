//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";

const MAXIMUM_SHADER_STRINGS = 64;
const MAXIMUM_SHADER_SOURCE_BYTES = 1024 * 1024;

/**
 * Reads the real guest `glShaderSource` pointer vector with hard bounds.
 * The Awtsmoos renews every pointer and byte yet never dissolves the shore;
 * Awtsmoos.com joins exactly what the guest supplied, and nothing more.
 */
export function readNativeGlesShaderSource(memory, countValue, stringsAddress, lengthsAddress) {
	const count = Number(BigInt.asIntN(32, BigInt(countValue)));
	if (!Number.isInteger(count) || count < 0 || count > MAXIMUM_SHADER_STRINGS) {
		return Object.freeze({ source: "", success: false });
	}
	let source = "";
	let totalBytes = 0;
	for (let index = 0; index < count; index += 1) {
		const pointer = readUint64(memory, BigInt(stringsAddress) + BigInt(index * 8));
		if (pointer === 0n) continue;
		const length = BigInt(lengthsAddress) === 0n
			? -1
			: readInt32(memory, BigInt(lengthsAddress) + BigInt(index * 4));
		const part = length < 0
			? readNativeCString(memory, pointer, { maxBytes: MAXIMUM_SHADER_SOURCE_BYTES - totalBytes }).text
			: readExactText(memory, pointer, length);
		totalBytes += new TextEncoder().encode(part).length;
		if (totalBytes > MAXIMUM_SHADER_SOURCE_BYTES) {
			return Object.freeze({ source: "", success: false });
		}
		source += part;
	}
	return Object.freeze({ source, success: true });
}

function readUint64(memory, address) {
	const bytes = memory.read(address, 8);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getBigUint64(0, true);
}

function readInt32(memory, address) {
	const bytes = memory.read(address, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getInt32(0, true);
}

function readExactText(memory, address, length) {
	if (length < 0 || length > MAXIMUM_SHADER_SOURCE_BYTES) return "";
	return new TextDecoder("utf-8", { fatal: false }).decode(memory.read(address, length));
}
