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

const ATOMIC_KINDS = new Set([
	"atomic_add_mem_imm",
	"atomic_add_mem_reg",
	"atomic_xadd_mem_reg"
]);

/**
 * Executes deterministic single-thread LOCK arithmetic. The Awtsmoos creates old
 * memory, exact source bits, wrapped sum, exchanged register, and flags anew;
 * Awtsmoos.com claims guest instruction order, not host-thread atomicity.
 */
export function executeAtomicOperation(item, registers, memory) {
	if (!ATOMIC_KINDS.has(item.kind)) return false;
	const address = effectiveAddress(item, registers);
	if (item.width === 64) {
		executeAtomic64(item, registers, memory, address);
		return true;
	}
	executeAtomic32(item, registers, memory, address);
	return true;
}

function executeAtomic64(item, registers, memory, address) {
	const left = memory.i64BigInt(address);
	const right = item.kind === "atomic_add_mem_imm"
		? BigInt(item.value)
		: registers.getBigInt(item.source);
	const result = BigInt.asIntN(64, left + right);
	memory.write64BigInt(address, BigInt.asUintN(64, result));
	if (item.kind === "atomic_xadd_mem_reg") {
		registers.setBigInt(item.source, left);
	}
	setAddFlags(registers, left, right, 64);
}

function executeAtomic32(item, registers, memory, address) {
	const left = memory.u32(address);
	const right = item.kind === "atomic_add_mem_imm"
		? item.value
		: readRegisterWidth(registers, item.source, 32);
	const result = wrapArithmetic(left + right, 32);
	memory.write32(address, signed32ForMemory(result));
	if (item.kind === "atomic_xadd_mem_reg") {
		writeRegisterWidth(registers, item.source, left, 32);
	}
	setAddFlags(registers, left, right, 32);
}
