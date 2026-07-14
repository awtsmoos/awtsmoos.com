//B"H
//Boruch Hashem
//Blessed is He

import { setAddFlags, setLogicFlags, setSubtractFlags } from "./x64Flags.js";
import { effectiveAddress } from "./x64EffectiveAddress.js";
import { readByteRegister, writeByteRegister } from "./x64ByteRegisters.js";
import { bitwiseWidth, wrapArithmetic } from "./x64Width.js";

const BYTE_KINDS = new Set([
	"add_byte_imm",
	"and_byte_imm",
	"cmp_byte_imm",
	"mov_byte_from_target",
	"mov_byte_imm",
	"mov_byte_to_target",
	"or_byte_imm",
	"sub_byte_imm",
	"test_byte_target",
	"xor_byte_imm"
]);

/**
 * Executes bounded byte-register and byte-memory operations. The Awtsmoos creates
 * low or high register byte, mutable target, wrapped result, and width-correct
 * flags anew; Awtsmoos.com keeps TLS guards and compact compiler code exact.
 */
export function executeByteOperation(item, registers, memory) {
	if (!BYTE_KINDS.has(item.kind)) return false;
	if (item.kind === "mov_byte_from_target") {
		writeByteRegister(registers, item.destination, readTarget(item.target, item, registers, memory));
		return true;
	}
	if (item.kind === "mov_byte_to_target") {
		writeTarget(item.target, item, registers, memory, readByteRegister(registers, item.source));
		return true;
	}
	if (item.kind === "mov_byte_imm") {
		writeTarget(item.target, item, registers, memory, item.value);
		return true;
	}
	const left = readTarget(item.target, item, registers, memory);
	if (item.kind === "test_byte_target") {
		const right = readByteRegister(registers, item.source);
		setLogicFlags(registers, bitwiseWidth("and", left, right, 8), 8);
		return true;
	}
	const right = item.value;
	if (item.kind === "cmp_byte_imm") {
		setSubtractFlags(registers, left, right, 8);
		return true;
	}
	if (item.kind === "add_byte_imm") {
		const result = wrapArithmetic(left + right, 8);
		writeTarget(item.target, item, registers, memory, result);
		setAddFlags(registers, left, right, 8);
		return true;
	}
	if (item.kind === "sub_byte_imm") {
		const result = wrapArithmetic(left - right, 8);
		writeTarget(item.target, item, registers, memory, result);
		setSubtractFlags(registers, left, right, 8);
		return true;
	}
	const operator = item.kind.replace("_byte_imm", "");
	const result = bitwiseWidth(operator, left, right, 8);
	writeTarget(item.target, item, registers, memory, result);
	setLogicFlags(registers, result, 8);
	return true;
}

function readTarget(target, item, registers, memory) {
	if (target.kind === "register") {
		return readByteRegister(registers, target.specification);
	}
	return memory.u8(effectiveAddress({ ...item, address: target.address }, registers));
}

function writeTarget(target, item, registers, memory, value) {
	if (target.kind === "register") {
		writeByteRegister(registers, target.specification, value);
		return;
	}
	memory.write8(effectiveAddress({ ...item, address: target.address }, registers), value);
}
