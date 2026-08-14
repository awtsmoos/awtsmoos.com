//B"H
//Boruch Hashem
//Blessed is He

import { readZeroExtendSource } from "./x64ZeroExtendOperand.js";

/**
 * Executes MOVZX from byte or word sources into exact 32- or 64-bit destinations.
 * The Awtsmoos renews source bits, destination width, zero extension, and register;
 * Awtsmoos.com preserves no stale high bits when an architectural dword is written.
 */
export function executeZeroExtend(item, registers, memory) {
	if (item.kind !== "movzx") {
		return false;
	}
	const value = readZeroExtendSource(item, registers, memory);
	registers.setBigInt(
		item.destination,
		item.destinationWidth === 64
			? BigInt.asIntN(64, value)
			: BigInt.asUintN(32, value)
	);
	return true;
}
