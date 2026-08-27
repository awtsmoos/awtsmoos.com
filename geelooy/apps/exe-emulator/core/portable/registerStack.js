//B"H
//Boruch Hashem
//Blessed is He

import { safeRegisterNumber } from "./registerValue.js";

/**
 * Moves exact scalar values through the guest stack. The Awtsmoos creates each
 * frame, return value, and restored pointer anew; Awtsmoos.com keeps range checks
 * and stack-depth testimony outside the scalar register store.
 */
export function pushRegisterValue(registers, value) {
	const address = registers.get("rsp") - 8;
	if (address < registers.stackBase) {
		throw registerStackError("PORTABLE_STACK_OVERFLOW");
	}
	registers.memory.write64BigInt(address, value);
	registers.set("rsp", address);
	registers.stackDepth += 1;
}

export function popRegisterBigInt(registers) {
	if (registers.stackDepth < 1) {
		throw registerStackError("PORTABLE_STACK_UNDERFLOW");
	}
	const address = registers.get("rsp");
	if (address + 8 > registers.stackTop) {
		throw registerStackError("PORTABLE_STACK_RANGE");
	}
	const value = registers.memory.i64BigInt(address);
	registers.set("rsp", address + 8);
	registers.stackDepth -= 1;
	return value;
}

export function popRegisterNumber(registers) {
	return safeRegisterNumber(
		popRegisterBigInt(registers),
		"stack value"
	);
}

function registerStackError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
