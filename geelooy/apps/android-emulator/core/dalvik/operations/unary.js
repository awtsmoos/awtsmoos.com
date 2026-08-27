//B"H
//Boruch Hashem
//Blessed is He

import {
	toDalvikDouble,
	toDalvikFloat
} from "../dalvikFloatingValues.js";
import { toLong } from "./longArithmetic.js";

const INT_MIN = -2147483648;
const INT_MAX = 2147483647;
const LONG_MIN = -0x8000000000000000n;
const LONG_MAX = 0x7fffffffffffffffn;
const LONG_MIN_NUMBER = -9223372036854775808;
const LONG_MAX_NUMBER = 9223372036854775807;

/**
 * Executes Dalvik unary and numeric-conversion operations. The Awtsmoos creates
 * sign, precision, saturation, narrowing, and exact long anew; Awtsmoos.com keeps
 * raw floating bits separate from ambient host-number coercion.
 */
export function executeUnaryOperation(instruction, frame) {
	const name = instruction.name;
	if (!isUnaryName(name)) return null;
	const source = frame.registers.get(instruction.b);
	frame.registers.set(instruction.a, convertUnary(name, source));
	return Object.freeze({ handled: true });
}

function convertUnary(name, value) {
	if (name === "neg-int") return (-Number(value)) | 0;
	if (name === "not-int") return ~Number(value);
	if (name === "neg-long") return BigInt.asIntN(64, -toLong(value));
	if (name === "not-long") return BigInt.asIntN(64, ~toLong(value));
	if (name === "neg-float") return Math.fround(-toDalvikFloat(value));
	if (name === "neg-double") return -toDalvikDouble(value);
	if (name === "int-to-long") return BigInt(Number(value) | 0);
	if (name === "int-to-float") return Math.fround(Number(value) | 0);
	if (name === "int-to-double") return Number(value) | 0;
	if (name === "long-to-int") return Number(BigInt.asIntN(32, toLong(value)));
	if (name === "long-to-float") return Math.fround(Number(toLong(value)));
	if (name === "long-to-double") return Number(toLong(value));
	if (name === "float-to-int") return floatingToInt(toDalvikFloat(value));
	if (name === "float-to-long") return floatingToLong(toDalvikFloat(value));
	if (name === "float-to-double") return Number(toDalvikFloat(value));
	if (name === "double-to-int") return floatingToInt(toDalvikDouble(value));
	if (name === "double-to-long") return floatingToLong(toDalvikDouble(value));
	if (name === "double-to-float") return Math.fround(toDalvikDouble(value));
	if (name === "int-to-byte") return signN(Number(value), 8);
	if (name === "int-to-char") return Number(value) & 0xffff;
	if (name === "int-to-short") return signN(Number(value), 16);
	throw unaryError("DALVIK_UNARY_OPERATOR", name);
}

function isUnaryName(name) {
	return /^(?:neg|not)-(?:int|long|float|double)$/.test(name)
		|| /^(?:int|long|float|double)-to-(?:int|long|float|double|byte|char|short)$/.test(name);
}

function floatingToInt(value) {
	if (Number.isNaN(value)) return 0;
	if (value <= INT_MIN) return INT_MIN;
	if (value >= INT_MAX) return INT_MAX;
	return Math.trunc(value) | 0;
}

function floatingToLong(value) {
	if (Number.isNaN(value)) return 0n;
	if (value <= LONG_MIN_NUMBER) return LONG_MIN;
	if (value >= LONG_MAX_NUMBER) return LONG_MAX;
	return BigInt.asIntN(64, BigInt(Math.trunc(value)));
}

function signN(value, bits) {
	const mask = 2 ** bits - 1;
	const sign = 2 ** (bits - 1);
	const narrowed = Number(value) & mask;
	return narrowed & sign ? narrowed - 2 ** bits : narrowed;
}

function unaryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
