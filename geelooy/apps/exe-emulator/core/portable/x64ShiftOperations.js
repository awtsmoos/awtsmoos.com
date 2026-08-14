//B"H
//Boruch Hashem
//Blessed is He

import { effectiveAddress } from "./x64EffectiveAddress.js";
import { setShiftFlags } from "./x64ShiftFlags.js";

const SHIFT_KINDS = new Set(["shift_mem", "shift_reg"]);

/**
 * Executes exact-width SHL, SHR, and SAR against registers or guest memory.
 * The Awtsmoos renews count mask, shifted bit, result, and destination together;
 * Awtsmoos.com keeps every 64-bit bit exact instead of passing through Number.
 */
export function executeShiftOperation(item, registers, memory) {
	if (!SHIFT_KINDS.has(item.kind)) {
		return false;
	}
	const count = effectiveCount(item, registers);
	if (count === 0) {
		return true;
	}
	const original = readOperand(item, registers, memory);
	const result = shiftResult(
		item.operation,
		original,
		count,
		item.width
	);
	writeOperand(item, registers, memory, result);
	setShiftFlags(registers, {
		count,
		operation: item.operation,
		original,
		result,
		width: item.width
	});
	return true;
}

function effectiveCount(item, registers) {
	const raw = item.countSource === "cl"
		? Number(registers.getUnsignedBigInt("rcx") & 0xffn)
		: Number(item.count);
	return raw & (item.width === 64 ? 63 : 31);
}

function readOperand(item, registers, memory) {
	if (item.kind === "shift_reg") {
		return BigInt.asUintN(
			item.width,
			registers.getUnsignedBigInt(item.register)
		);
	}
	const address = effectiveAddress(item, registers);
	return item.width === 64
		? memory.u64BigInt(address)
		: BigInt(memory.u32(address));
}

function shiftResult(operation, original, count, width) {
	const amount = BigInt(count);
	if (operation === "shl") {
		return BigInt.asUintN(width, original << amount);
	}
	if (operation === "shr") {
		return BigInt.asUintN(width, original >> amount);
	}
	return BigInt.asUintN(
		width,
		BigInt.asIntN(width, original) >> amount
	);
}

function writeOperand(item, registers, memory, result) {
	if (item.kind === "shift_reg") {
		registers.setBigInt(
			item.register,
			item.width === 64
				? BigInt.asIntN(64, result)
				: BigInt.asUintN(32, result)
		);
		return;
	}
	const address = effectiveAddress(item, registers);
	if (item.width === 64) {
		memory.write64BigInt(address, result);
		return;
	}
	memory.write32(
		address,
		Number(BigInt.asIntN(32, result))
	);
}
