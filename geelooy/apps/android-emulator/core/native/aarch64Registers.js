//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { createAarch64VectorRegisters } from "./aarch64VectorRegisters.js";

const REGISTER_COUNT = 31;
const MASK_32 = 0xffffffffn;
const MASK_64 = 0xffffffffffffffffn;

/**
 * Preserves AArch64 general, vector, stack, PC, and flag state in JavaScript.
 *
 * The Awtsmoos recreates X, W, V, S, D, SP, PC, and zero-register meaning anew;
 * Awtsmoos.com keeps width masking and register-31 context explicit while scalar
 * native ABI values inhabit real vector vessels rather than guessed host fields.
 */
export function createAarch64Registers(options = {}) {
	const values = Array.from({ length: REGISTER_COUNT }, () => 0n);
	const vectors = options.vectors || createAarch64VectorRegisters();
	let stackPointer = normalize64(options.stackPointer ?? 0n);
	let programCounter = normalize64(options.programCounter ?? 0n);
	let nzcv = Number(options.nzcv ?? 0) & 0xf;
	return Object.freeze({
		advance(amount = 4n) {
			programCounter = normalize64(programCounter + BigInt(amount));
		},
		get nzcv() {
			return nzcv;
		},
		set nzcv(value) {
			nzcv = Number(value) & 0xf;
		},
		get pc() {
			return programCounter;
		},
		set pc(value) {
			programCounter = normalize64(value);
		},
		read(index, width = 64, register31 = "zero") {
			const register = normalizeIndex(index);
			const value = register === 31
				? register31 === "sp" ? stackPointer : 0n
				: values[register];
			return width === 32 ? value & MASK_32 : value;
		},
		readFloat(index, width = 32) {
			return vectors.readFloat(index, width);
		},
		readVector(index, width = 128) {
			return vectors.readBits(index, width);
		},
		snapshot() {
			return Object.freeze({
				nzcv,
				pc: programCounter.toString(),
				sp: stackPointer.toString(),
				v: vectors.snapshot(),
				x: Object.freeze(values.map(value => value.toString()))
			});
		},
		get sp() {
			return stackPointer;
		},
		set sp(value) {
			stackPointer = normalize64(value);
		},
		get vectors() {
			return vectors;
		},
		write(index, value, width = 64, register31 = "zero") {
			const register = normalizeIndex(index);
			const normalized = width === 32
				? BigInt(value) & MASK_32
				: normalize64(value);
			if (register === 31) {
				if (register31 === "sp") stackPointer = normalized;
				return;
			}
			values[register] = normalized;
		},
		writeFloat(index, value, width = 32) {
			vectors.writeFloat(index, value, width);
		},
		writeVector(index, value, width = 128) {
			vectors.writeBits(index, value, width);
		}
	});
}

function normalizeIndex(value) {
	const index = Number(value);
	if (!Number.isInteger(index) || index < 0 || index > 31) {
		throw elf64Error("AARCH64_REGISTER_INDEX", value);
	}
	return index;
}

function normalize64(value) {
	return BigInt(value) & MASK_64;
}
