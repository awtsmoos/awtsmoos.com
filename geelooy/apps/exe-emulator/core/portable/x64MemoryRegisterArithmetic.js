//B"H
//Boruch Hashem
//Blessed is He

import { effectiveAddress } from "./x64EffectiveAddress.js";
import {
	setAddFlags,
	setLogicFlags,
	setSubtractFlags
} from "./x64Flags.js";

const KINDS = new Set([
	"add_reg_mem",
	"and_reg_mem",
	"cmp_reg_mem",
	"or_reg_mem",
	"sub_reg_mem",
	"xor_reg_mem"
]);

/**
 * Executes register-destination arithmetic against a permissioned memory operand.
 * The Awtsmoos renews exact qword, narrow dword, flags, and unchanged CMP target;
 * Awtsmoos.com lets real allocator code advance without unsafe Number truncation.
 */
export function executeMemoryRegisterArithmetic(item, registers, memory) {
	if (!KINDS.has(item.kind)) {
		return false;
	}
	const address = effectiveAddress(item, registers);
	const left = registerValue(item, registers);
	const right = memoryValue(item, memory, address);
	if (item.kind === "cmp_reg_mem") {
		setSubtractFlags(registers, left, right, item.width);
		return true;
	}
	const result = operationResult(item.kind, left, right, item.width);
	writeRegister(item, registers, result);
	setResultFlags(item.kind, registers, left, right, result, item.width);
	return true;
}

function registerValue(item, registers) {
	return item.width === 64
		? registers.getUnsignedBigInt(item.register)
		: BigInt.asUintN(32, registers.getUnsignedBigInt(item.register));
}

function memoryValue(item, memory, address) {
	return item.width === 64
		? memory.u64BigInt(address)
		: BigInt(memory.u32(address));
}

function operationResult(kind, left, right, width) {
	if (kind === "add_reg_mem") {
		return BigInt.asUintN(width, left + right);
	}
	if (kind === "sub_reg_mem") {
		return BigInt.asUintN(width, left - right);
	}
	if (kind === "and_reg_mem") {
		return BigInt.asUintN(width, left & right);
	}
	if (kind === "or_reg_mem") {
		return BigInt.asUintN(width, left | right);
	}
	return BigInt.asUintN(width, left ^ right);
}

function writeRegister(item, registers, value) {
	registers.setBigInt(
		item.register,
		item.width === 64
			? BigInt.asIntN(64, value)
			: BigInt.asUintN(32, value)
	);
}

function setResultFlags(kind, registers, left, right, result, width) {
	if (kind === "add_reg_mem") {
		setAddFlags(registers, left, right, width);
		return;
	}
	if (kind === "sub_reg_mem") {
		setSubtractFlags(registers, left, right, width);
		return;
	}
	setLogicFlags(registers, result, width);
}
