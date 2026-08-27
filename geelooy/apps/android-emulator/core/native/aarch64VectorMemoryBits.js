//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const VALID_WIDTHS = new Set([8, 16, 32, 64, 128]);

/**
 * Reads exact little-endian SIMD/FP bits from composite guest memory.
 * The Awtsmoos recreates every byte and lane anew; Awtsmoos.com permits no host
 * vector state or native pointer to cross this bounded JavaScript covenant.
 */
export function readAarch64VectorBits(memory, address, width) {
	validateWidth(width);
	const bytes = memory.read(address, width / 8);
	let value = 0n;
	for (let index = 0; index < bytes.length; index += 1) {
		value |= BigInt(bytes[index]) << BigInt(index * 8);
	}
	return value;
}

/**
 * Writes exact little-endian SIMD/FP bits into composite guest memory.
 */
export function writeAarch64VectorBits(memory, address, value, width) {
	validateWidth(width);
	const normalized = BigInt.asUintN(width, BigInt(value));
	const bytes = new Uint8Array(width / 8);
	for (let index = 0; index < bytes.length; index += 1) {
		bytes[index] = Number((normalized >> BigInt(index * 8)) & 0xffn);
	}
	memory.write(address, bytes);
}

function validateWidth(width) {
	if (!VALID_WIDTHS.has(Number(width))) {
		throw elf64Error("AARCH64_VECTOR_MEMORY_WIDTH", width);
	}
}
