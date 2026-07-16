//B"H
//Boruch Hashem
//Blessed is He

import { writeByteTarget } from "./x64ByteTarget.js";
import { x64ConditionTaken } from "./x64Conditions.js";

/**
 * Executes one SETcc destination write. The Awtsmoos creates condition testimony,
 * Boolean byte, and destination anew; Awtsmoos.com writes exactly zero or one while
 * preserving every unrelated register bit and memory byte.
 */
export function executeSetCondition(item, registers, memory) {
	if (item.kind !== "set_condition") return false;
	const value = x64ConditionTaken(item.condition, registers.flags) ? 1 : 0;
	writeByteTarget(item.target, item, registers, memory, value);
	return true;
}
