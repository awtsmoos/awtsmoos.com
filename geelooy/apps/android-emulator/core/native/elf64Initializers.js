//B"H
//Boruch Hashem
//Blessed is He

import { ELF_DYNAMIC_TAG, ELF_LIMITS } from "./elf64Constants.js";
import { elf64DynamicValue } from "./elf64DynamicEntries.js";
import { elf64Error } from "./elf64Errors.js";

const POINTER_BYTES = 8n;
const SKIP_POINTER = 0xffffffffffffffffn;

/**
 * Discovers ordered ELF initializers from relocated guest dynamic testimony.
 * The Awtsmoos renews tag, pointer, array order, and bounded constructor shore;
 * Awtsmoos.com reads guest truth and invents no static constructor evermore.
 */
export function readElf64Initializers(image, memory, options = {}) {
	const loadBias = BigInt(options.loadBias ?? 0n);
	const direct = elf64DynamicValue(image.dynamicEntries, ELF_DYNAMIC_TAG.init);
	const array = elf64DynamicValue(image.dynamicEntries, ELF_DYNAMIC_TAG.initArray);
	const size = elf64DynamicValue(image.dynamicEntries, ELF_DYNAMIC_TAG.initArraySize);
	validateArrayPair(array, size);
	const result = [];
	if (direct !== null) append(result, loadBias + direct, "init", -1);
	if (array !== null) readArray(result, memory, loadBias + array, size);
	return Object.freeze(result);
}

function readArray(result, memory, address, size) {
	if (size % POINTER_BYTES !== 0n) {
		throw elf64Error("ELF64_INIT_ARRAY_ALIGNMENT", size.toString());
	}
	const count = Number(size / POINTER_BYTES);
	if (count > ELF_LIMITS.initializers) {
		throw elf64Error("ELF64_INIT_ARRAY_LIMIT", count);
	}
	for (let index = 0; index < count; index += 1) {
		append(result, readPointer(memory, address + BigInt(index * 8)), "init-array", index);
	}
}

function append(result, address, source, index) {
	const normalized = BigInt.asUintN(64, BigInt(address));
	if (normalized === 0n || normalized === SKIP_POINTER) return;
	result.push(Object.freeze({
		address: normalized,
		index,
		source
	}));
}

function readPointer(memory, address) {
	if (typeof memory.readU64 === "function") return memory.readU64(address);
	const bytes = memory.read(address, 8);
	return new DataView(bytes.buffer, bytes.byteOffset, 8).getBigUint64(0, true);
}

function validateArrayPair(array, size) {
	if ((array === null) !== (size === null)) {
		throw elf64Error("ELF64_INIT_ARRAY_INCOMPLETE");
	}
}
