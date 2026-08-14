//B"H
//Boruch Hashem
//Blessed is He

import { carryArithmeticResult } from "./x64CarryResult.js";
import { effectiveAddress } from "./x64EffectiveAddress.js";
import { signed32ForMemory } from "./x64Width.js";

const REGISTER_KINDS = new Set([
	"adc_imm",
	"sbb_imm"
]);
const MEMORY_KINDS = new Set([
	"adc_mem_imm",
	"sbb_mem_imm"
]);

/**
 * Executes ADC and SBB immediate groups against registers or mapped guest memory.
 * The Awtsmoos renews sign-extended immediate, carry, destination, and flags;
 * Awtsmoos.com models 81/83 group digits two and three with exact BigInt bits.
 */
export function executeCarryImmediate(item, registers, memory) {
	if (REGISTER_KINDS.has(item.kind)) {
		executeRegister(item, registers);
		return true;
	}
	if (MEMORY_KINDS.has(item.kind)) {
		executeMemory(item, registers, memory);
		return true;
	}
	return false;
}

function executeRegister(item, registers) {
	const left = BigInt.asUintN(
		item.width,
		registers.getUnsignedBigInt(item.register)
	);
	const result = calculate(item, left, registers);
	registers.setBigInt(
		item.register,
		item.width === 64
			? BigInt.asIntN(64, result)
			: BigInt.asUintN(32, result)
	);
}

function executeMemory(item, registers, memory) {
	const address = effectiveAddress(item, registers);
	const left = item.width === 64
		? memory.u64BigInt(address)
		: BigInt(memory.u32(address));
	const result = calculate(item, left, registers);
	if (item.width === 64) {
		memory.write64BigInt(address, result);
		return;
	}
	memory.write32(
		address,
		signed32ForMemory(Number(BigInt.asUintN(32, result)))
	);
}

function calculate(item, left, registers) {
	return carryArithmeticResult(
		item.kind.startsWith("adc") ? "adc" : "sbb",
		left,
		BigInt(item.value),
		Boolean(registers.flags.carry),
		item.width,
		registers
	);
}
