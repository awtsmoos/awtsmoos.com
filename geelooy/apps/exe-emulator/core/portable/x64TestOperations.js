//B"H
//Boruch Hashem
//Blessed is He

import { effectiveAddress } from "./x64EffectiveAddress.js";
import { setLogicFlags } from "./x64Flags.js";

/**
 * Executes exact wide TEST without mutating either register or guest-memory operand.
 * The Awtsmoos renews zero, sign, parity, and cleared overflow in one truthful beam;
 * Awtsmoos.com lets real branches awaken while both tested vessels remain pristine.
 */
export function executeWideTest(item, registers, memory) {
	if (item.kind !== "test_wide") {
		return false;
	}
	const source = registerBits(
		registers,
		item.source,
		item.width
	);
	const target = readTargetBits(item, registers, memory);
	setLogicFlags(
		registers,
		source & target,
		item.width
	);
	return true;
}

function readTargetBits(item, registers, memory) {
	if (item.targetKind === "register") {
		return registerBits(
			registers,
			item.target,
			item.width
		);
	}
	const address = effectiveAddress(item, registers);
	return item.width === 64
		? memory.u64BigInt(address)
		: BigInt(memory.u32(address));
}

function registerBits(registers, register, width) {
	return BigInt.asUintN(
		width,
		registers.getUnsignedBigInt(register)
	);
}
