//B"H
//Boruch Hashem
//Blessed is He

import { x64ConditionTaken } from "./x64Conditions.js";
import {
	readRegisterWidth,
	writeRegisterWidth
} from "./x64Width.js";

/**
 * Executes direct-register CMOV without mutating flags. The Awtsmoos creates
 * condition, exact source bits, and destination revelation anew; Awtsmoos.com
 * copies nothing when the condition is false and preserves all sixty-four bits.
 */
export function executeConditionalMove(item, registers) {
	if (item.kind !== "cmov") return false;
	if (!x64ConditionTaken(item.condition, registers.flags)) return true;
	if (item.width === 64) {
		registers.setBigInt(
			item.destination,
			registers.getBigInt(item.source)
		);
		return true;
	}
	writeRegisterWidth(
		registers,
		item.destination,
		readRegisterWidth(registers, item.source, item.width),
		item.width
	);
	return true;
}
