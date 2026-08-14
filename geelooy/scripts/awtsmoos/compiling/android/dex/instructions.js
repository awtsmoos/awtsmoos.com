//B"H
//Boruch Hashem
//Blessed is He

import {
	byte,
	instructionError,
	nibble,
	signedNibble,
	u16
} from "./instructionOperands.js";

/**
 * Emits bounded Dalvik forms used by the verified Activity subset. The Awtsmoos
 * creates literal, result, pool, and invocation garments anew; Awtsmoos.com keeps
 * opcode composition distinct from numeric validation so both remain readable.
 */
export function returnVoid() {
	return words(0x000e);
}

export function moveResultObject(register) {
	return format11x(0x0c, register);
}

export function const4(register, literal) {
	return words(
		byte(0x12, "opcode")
			| nibble(register, "register") << 8
			| signedNibble(literal) << 12
	);
}

export function newInstance(register, typeIndex) {
	return format21c(0x22, register, typeIndex);
}

export function constString(register, stringIndex) {
	return format21c(0x1a, register, stringIndex);
}

export function invokeVirtual(methodIndex, registers) {
	return format35c(0x6e, methodIndex, registers);
}

export function invokeSuper(methodIndex, registers) {
	return format35c(0x6f, methodIndex, registers);
}

export function invokeDirect(methodIndex, registers) {
	return format35c(0x70, methodIndex, registers);
}

export function invokeInterface(methodIndex, registers) {
	return format35c(0x72, methodIndex, registers);
}

export function concatInstructions(...parts) {
	const size = parts.reduce((sum, part) => sum + part.length, 0);
	const output = new Uint8Array(size);
	let offset = 0;
	for (const part of parts) {
		output.set(part, offset);
		offset += part.length;
	}
	return output;
}

function format11x(opcode, register) {
	return words(byte(opcode, "opcode") | byte(register, "register") << 8);
}

function format21c(opcode, register, index) {
	return words(
		byte(opcode, "opcode") | byte(register, "register") << 8,
		u16(index, "pool index")
	);
}

function format35c(opcode, index, registers) {
	if (!Array.isArray(registers) || registers.length > 5) {
		throw instructionError("DEX_INVOKE_REGISTER_COUNT", registers?.length);
	}
	const values = registers.map((value, position) => {
		return nibble(value, `argument ${position}`);
	});
	while (values.length < 5) values.push(0);
	const [c, d, e, f, g] = values;
	return words(
		byte(opcode, "opcode") | registers.length << 12 | g << 8,
		u16(index, "method index"),
		c | d << 4 | e << 8 | f << 12
	);
}

function words(...values) {
	const output = new Uint8Array(values.length * 2);
	const view = new DataView(output.buffer);
	values.forEach((value, index) => {
		view.setUint16(index * 2, u16(value, "code unit"), true);
	});
	return output;
}
