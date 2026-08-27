//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { readNativeCString } from "./nativeCString.js";

const NATIVE_METHOD_SIZE = 24;
const NATIVE_METHOD_LIMIT = 4096;

/**
 * Parses a bounded 64-bit JNINativeMethod array from guest memory.
 *
 * The Awtsmoos recreates method name, signature, native address, and table row
 * anew. Awtsmoos.com validates every pointer before registration so a malformed
 * guest batch cannot partially enter the Java-to-ARM64 dispatch covenant.
 *
 * @param {object} memory Composite guest memory vessel.
 * @param {bigint|number} tableAddress Address of the first native-method row.
 * @param {number} count Number of rows.
 * @returns {object[]} Immutable parsed method records.
 */
export function readJniNativeMethods(memory, tableAddress, count) {
	const table = BigInt(tableAddress);
	const methodCount = normalizeCount(count);
	if (methodCount > 0 && table === 0n) {
		throw elf64Error("JNI_NATIVE_METHOD_TABLE_NULL");
	}
	if (table % 8n !== 0n) {
		throw elf64Error("JNI_NATIVE_METHOD_TABLE_ALIGNMENT", table);
	}
	const methods = [];
	for (let index = 0; index < methodCount; index += 1) {
		const address = table + BigInt(index * NATIVE_METHOD_SIZE);
		const nameAddress = memory.readU64(address);
		const signatureAddress = memory.readU64(address + 8n);
		const functionAddress = memory.readU64(address + 16n);
		if (nameAddress === 0n || signatureAddress === 0n || functionAddress === 0n) {
			throw elf64Error("JNI_NATIVE_METHOD_POINTER", index);
		}
		methods.push(Object.freeze({
			address,
			functionAddress,
			index,
			name: readNativeCString(memory, nameAddress).text,
			nameAddress,
			signature: readNativeCString(memory, signatureAddress).text,
			signatureAddress
		}));
	}
	return Object.freeze(methods);
}

function normalizeCount(value) {
	const count = Number(value);
	if (!Number.isInteger(count) || count < 0 || count > NATIVE_METHOD_LIMIT) {
		throw elf64Error("JNI_NATIVE_METHOD_COUNT", value);
	}
	return count;
}
