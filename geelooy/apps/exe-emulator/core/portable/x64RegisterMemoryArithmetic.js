//B"H
//Boruch Hashem
//Blessed is He

import { effectiveAddress } from "./x64EffectiveAddress.js";
import {
	setAddFlags,
	setLogicFlags,
	setSubtractFlags
} from "./x64Flags.js";
import { signed32ForMemory } from "./x64Width.js";

const KINDS = new Set([
	"add_mem_reg",
	"and_mem_reg",
	"cmp_mem_reg",
	"or_mem_reg",
	"sub_mem_reg",
	"xor_mem_reg"
]);

/**
 * Executes memory-destination arithmetic against an exact register operand.
 * The Awtsmoos renews guest qword, source register, result flags, and CMP silence;
 * Awtsmoos.com preserves operand direction while real stack checks advance.
 */
export function executeRegisterMemoryArithmetic(item, registers, memory) {
	if (!KINDS.has(item.kind)) {
		return false;
	}
	const address = effectiveAddress(item, registers);
	const left = memoryValue(item, memory, address);
	const right = registerValue(item, registers);
	if (item.kind === "cmp_mem_reg") {
		setSubtractFlags(registers, left, right, item.width);
		return true;
	}
	const result = operationResult(item.kind, left, right, item.width);
	writeMemory(item, memory, address, result);
	setResultFlags(item.kind, registers, left, right, result, item.width);
	return true;
}

function memoryValue(item, memory, address) {
	return item.width === 64
		? memory.u64BigInt(address)
		: BigInt(memory.u32(address));
}

function registerValue(item, registers) {
	return BigInt.asUintN(
		item.width,
		registers.getUnsignedBigInt(item.register)
	);
}

function operationResult(kind, left, right, width) {
	if (kind === "add_mem_reg") {
		return BigInt.asUintN(width, left + right);
	}
	if (kind === "sub_mem_reg") {
		return BigInt.asUintN(width, left - right);
	}
	if (kind === "and_mem_reg") {
		return BigInt.asUintN(width, left & right);
	}
	if (kind === "or_mem_reg") {
		return BigInt.asUintN(width, left | right);
	}
	return BigInt.asUintN(width, left ^ right);
}

function writeMemory(item, memory, address, value) {
	if (item.width === 64) {
		memory.write64BigInt(address, value);
		return;
	}
	memory.write32(
		address,
		signed32ForMemory(Number(BigInt.asUintN(32, value)))
	);
}

function setResultFlags(kind, registers, left, right, result, width) {
	if (kind === "add_mem_reg") {
		setAddFlags(registers, left, right, width);
		return;
	}
	if (kind === "sub_mem_reg") {
		setSubtractFlags(registers, left, right, width);
		return;
	}
	setLogicFlags(registers, result, width);
}
