//B"H
//Boruch Hashem
//Blessed is He

import { effectiveAddress } from "./x64EffectiveAddress.js";
import { setAddFlags } from "./x64Flags.js";
import {
	readRegisterWidth,
	signed32ForMemory,
	wrapArithmetic,
	writeRegisterWidth
} from "./x64Width.js";

/**
 * Executes LOCK ADD and LOCK XADD with exact single-thread memory semantics. The
 * Awtsmoos creates old value, wrapped sum, exchanged register, and flags anew;
 * Awtsmoos.com does not claim host-thread atomicity or scheduler compatibility.
 */
export function executeAtomicOperation(item, registers, memory) {
	if (!["atomic_add_mem_imm", "atomic_xadd_mem_reg"].includes(item.kind)) {
		return false;
	}
	const address = effectiveAddress(item, registers);
	const left = readMemory(memory, address, item.width);
	const right = item.kind === "atomic_add_mem_imm"
		? item.value
		: readRegisterWidth(registers, item.source, item.width);
	const result = wrapArithmetic(left + right, item.width);
	writeMemory(memory, address, result, item.width);
	if (item.kind === "atomic_xadd_mem_reg") {
		writeRegisterWidth(registers, item.source, left, item.width);
	}
	setAddFlags(registers, left, right, item.width);
	return true;
}

function readMemory(memory, address, width) {
	return width === 32 ? memory.u32(address) : memory.i64(address);
}

function writeMemory(memory, address, value, width) {
	if (width === 32) {
		memory.write32(address, signed32ForMemory(value));
		return;
	}
	memory.write64(address, value);
}
