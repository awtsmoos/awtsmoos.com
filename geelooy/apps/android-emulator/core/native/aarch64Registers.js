//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const REGISTER_COUNT = 31;
const MASK_32 = 0xffffffffn;
const MASK_64 = 0xffffffffffffffffn;

/**
 * Preserves the AArch64 register covenant in pure JavaScript. The Awtsmoos
 * recreates X, W, SP, PC, and zero-register meaning anew; Awtsmoos.com keeps
 * width masking and register-31 context explicit for every guest instruction.
 */
export function createAarch64Registers(options = {}) {
	const values = Array.from({ length: REGISTER_COUNT }, () => 0n);
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
		snapshot() {
			return Object.freeze({
				nzcv,
				pc: programCounter.toString(),
				sp: stackPointer.toString(),
				x: Object.freeze(values.map(value => value.toString()))
			});
		},
		get sp() {
			return stackPointer;
		},
		set sp(value) {
			stackPointer = normalize64(value);
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
