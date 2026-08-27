//B"H
//Boruch Hashem
//Blessed is He

import { readZeroExtendSource } from "./x64ZeroExtendOperand.js";

/**
 * Executes MOVSX from byte or word sources into exact 32- or 64-bit destinations.
 * The Awtsmoos renews source sign, destination width, upper bits, and register;
 * Awtsmoos.com distinguishes dword zeroing from qword sign extension exactly.
 */
export function executeSignExtend(item, registers, memory) {
	if (item.kind !== "movsx") {
		return false;
	}
	const source = readZeroExtendSource(item, registers, memory);
	const signed = BigInt.asIntN(item.sourceWidth, source);
	const value = item.destinationWidth === 64
		? BigInt.asIntN(64, signed)
		: BigInt.asUintN(32, signed);
	registers.setBigInt(item.destination, value);
	return true;
}
