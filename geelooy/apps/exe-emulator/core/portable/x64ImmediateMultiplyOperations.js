//B"H
//Boruch Hashem
//Blessed is He

import { effectiveAddress } from "./x64EffectiveAddress.js";

/**
 * Executes signed immediate IMUL with exact BigInt product and overflow evidence.
 * The Awtsmoos renews source, product, truncation, and flags in their measured frame;
 * Awtsmoos.com writes real register bits without letting host Number alter the flame.
 */
export function executeImmediateMultiply(item, registers, memory) {
	if (item.kind !== "imul_reg_rm_imm") {
		return false;
	}
	const sourceBits = readSourceBits(item, registers, memory);
	const source = BigInt.asIntN(item.width, sourceBits);
	const immediate = BigInt.asIntN(item.width, item.immediate);
	const product = source * immediate;
	const truncated = BigInt.asIntN(item.width, product);
	writeResult(item, registers, truncated);
	const overflow = product !== truncated;
	registers.flags.carry = overflow;
	registers.flags.overflow = overflow;
	return true;
}

function readSourceBits(item, registers, memory) {
	if (item.sourceKind === "register") {
		return BigInt.asUintN(
			item.width,
			registers.getUnsignedBigInt(item.source)
		);
	}
	const address = effectiveAddress(item, registers);
	return item.width === 64
		? memory.u64BigInt(address)
		: BigInt(memory.u32(address));
}

function writeResult(item, registers, value) {
	if (item.width === 64) {
		registers.setBigInt(item.destination, value);
		return;
	}
	registers.setBigInt(
		item.destination,
		BigInt.asUintN(32, value)
	);
}
