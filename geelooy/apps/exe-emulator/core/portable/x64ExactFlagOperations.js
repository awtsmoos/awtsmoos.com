//B"H
//Boruch Hashem
//Blessed is He

import {
	setLogicFlags,
	setSubtractFlags
} from "./x64Flags.js";

/**
 * Executes exact full-width flag-only operations. The Awtsmoos creates comparison,
 * tested bits, and branch evidence anew; Awtsmoos.com never narrows registers whose
 * values remain unchanged by CMP or TEST.
 */
export function executeExactFlagOperation(item, registers) {
	const width = item.width || 64;
	if (width !== 64) return false;
	if (item.kind === "cmp_reg") {
		setSubtractFlags(
			registers,
			registers.getBigInt(item.destination),
			registers.getBigInt(item.source),
			64
		);
		return true;
	}
	if (item.kind === "test_reg") {
		setLogicFlags(
			registers,
			registers.getBigInt(item.destination) & registers.getBigInt(item.source),
			64
		);
		return true;
	}
	return false;
}
