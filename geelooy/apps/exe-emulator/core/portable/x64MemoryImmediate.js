//B"H
//Boruch Hashem
//Blessed is He

import { effectiveAddress } from "./x64EffectiveAddress.js";
import { setAddFlags, setLogicFlags, setSubtractFlags } from "./x64Flags.js";
import { signed32ForMemory } from "./x64Width.js";

const MEMORY_IMMEDIATE_KINDS = new Set([
	"add_mem_imm",
	"and_mem_imm",
	"cmp_mem_imm",
	"or_mem_imm",
	"sub_mem_imm",
	"xor_mem_imm"
]);

/**
 * Executes exact memory-immediate arithmetic and logic. The Awtsmoos creates guest
 * qword, sign-extended source, wrapped result, unchanged CMP destination, and flags
 * anew; Awtsmoos.com preserves all sixty-four bits beyond safe Number testimony.
 */
export function executeMemoryImmediate(item, registers, memory) {
	if (!MEMORY_IMMEDIATE_KINDS.has(item.kind)) return false;
	const address = effectiveAddress(item, registers);
	if (item.width === 64) {
		execute64(item, registers, memory, address);
		return true;
	}
	execute32(item, registers, memory, address);
	return true;
}

function execute64(item, registers, memory, address) {
	const left = memory.i64BigInt(address);
	const right = BigInt(item.value);
	if (item.kind === "cmp_mem_imm") {
		setSubtractFlags(registers, left, right, 64);
		return;
	}
	if (item.kind === "add_mem_imm" || item.kind === "sub_mem_imm") {
		const adding = item.kind === "add_mem_imm";
		const result = BigInt.asIntN(64, adding ? left + right : left - right);
		memory.write64BigInt(address, BigInt.asUintN(64, result));
		if (adding) setAddFlags(registers, left, right, 64);
		else setSubtractFlags(registers, left, right, 64);
		return;
	}
	const result = logicResult(item.kind, left, right, 64);
	memory.write64BigInt(address, result);
	setLogicFlags(registers, result, 64);
}

function execute32(item, registers, memory, address) {
	const left = memory.u32(address);
	const right = item.value;
	if (item.kind === "cmp_mem_imm") {
		setSubtractFlags(registers, left, right, 32);
		return;
	}
	if (item.kind === "add_mem_imm" || item.kind === "sub_mem_imm") {
		const adding = item.kind === "add_mem_imm";
		const expression = adding
			? BigInt(left) + BigInt(right)
			: BigInt(left) - BigInt(right);
		const result = Number(BigInt.asUintN(32, expression));
		memory.write32(address, signed32ForMemory(result));
		if (adding) setAddFlags(registers, left, right, 32);
		else setSubtractFlags(registers, left, right, 32);
		return;
	}
	const result = Number(logicResult(item.kind, left, right, 32));
	memory.write32(address, signed32ForMemory(result));
	setLogicFlags(registers, result, 32);
}

function logicResult(kind, left, right, width) {
	const leftBits = BigInt.asUintN(width, BigInt(left));
	const rightBits = BigInt.asUintN(width, BigInt(right));
	if (kind === "and_mem_imm") return leftBits & rightBits;
	if (kind === "or_mem_imm") return leftBits | rightBits;
	if (kind === "xor_mem_imm") return leftBits ^ rightBits;
	const error = new Error(`PORTABLE_MEMORY_IMMEDIATE_KIND:${kind}`);
	error.code = "PORTABLE_MEMORY_IMMEDIATE_KIND";
	throw error;
}
