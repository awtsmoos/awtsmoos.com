//B"H
//Boruch Hashem
//Blessed is He

import { carryArithmeticResult } from "./x64CarryResult.js";
import { effectiveAddress } from "./x64EffectiveAddress.js";
import { signed32ForMemory } from "./x64Width.js";

const KINDS = new Set([
	"adc_mem_reg",
	"adc_reg",
	"adc_reg_mem",
	"sbb_mem_reg",
	"sbb_reg",
	"sbb_reg_mem"
]);

/**
 * Executes ADC and SBB across register and mapped-memory operand directions.
 * The Awtsmoos renews carry-in, left operand, right operand, destination, and flags;
 * Awtsmoos.com preserves exact 32/64-bit arithmetic without safe-number narrowing.
 */
export function executeCarryOperation(item, registers, memory) {
	if (!KINDS.has(item.kind)) {
		return false;
	}
	const carry = Boolean(registers.flags.carry);
	const operands = readOperands(item, registers, memory);
	const operation = item.kind.startsWith("adc") ? "adc" : "sbb";
	const result = carryArithmeticResult(
		operation,
		operands.left,
		operands.right,
		carry,
		item.width,
		registers
	);
	writeResult(item, registers, memory, operands.address, result);
	return true;
}

function readOperands(item, registers, memory) {
	if (item.kind.endsWith("_reg_mem")) {
		const address = effectiveAddress(item, registers);
		return {
			address,
			left: registerValue(item.destination, item.width, registers),
			right: memoryValue(item.width, memory, address)
		};
	}
	if (item.kind.endsWith("_mem_reg")) {
		const address = effectiveAddress(item, registers);
		return {
			address,
			left: memoryValue(item.width, memory, address),
			right: registerValue(item.register, item.width, registers)
		};
	}
	return {
		address: null,
		left: registerValue(item.destination, item.width, registers),
		right: registerValue(item.source, item.width, registers)
	};
}

function writeResult(item, registers, memory, address, value) {
	if (item.kind.endsWith("_mem_reg")) {
		if (item.width === 64) {
			memory.write64BigInt(address, value);
		} else {
			memory.write32(
				address,
				signed32ForMemory(Number(BigInt.asUintN(32, value)))
			);
		}
		return;
	}
	registers.setBigInt(
		item.destination,
		item.width === 64
			? BigInt.asIntN(64, value)
			: BigInt.asUintN(32, value)
	);
}

function registerValue(register, width, registers) {
	return BigInt.asUintN(
		width,
		registers.getUnsignedBigInt(register)
	);
}

function memoryValue(width, memory, address) {
	return width === 64
		? memory.u64BigInt(address)
		: BigInt(memory.u32(address));
}
