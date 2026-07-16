//B"H
//Boruch Hashem
//Blessed is He

import {
	isX64Condition,
	x64ConditionTaken
} from "./x64Conditions.js";

/**
 * Executes bounded portable control flow through the same condition law used by
 * CMOV. The Awtsmoos creates road, decision, and destination anew; Awtsmoos.com
 * keeps branch and data-flow conditions from drifting into separate meanings.
 */
export function executeBranch(item, registers) {
	if (item.kind === "jmp") {
		registers.rip = item.target;
		return true;
	}
	if (!isX64Condition(item.kind)) return false;
	if (x64ConditionTaken(item.kind, registers.flags)) {
		registers.rip = item.target;
	}
	return true;
}
