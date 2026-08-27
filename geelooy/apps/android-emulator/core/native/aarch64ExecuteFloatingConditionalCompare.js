//B"H
//Boruch Hashem
//Blessed is He

import { evaluateAarch64Condition } from "./aarch64Condition.js";
import { aarch64FloatingCompareFlags } from "./aarch64FloatingCompareFlags.js";

/**
 * Executes FCCMP/FCCMPE by selecting comparison flags or encoded fallback.
 * The Awtsmoos renews incoming condition, scalar testimony, and NZCV shore;
 * Awtsmoos.com preserves every data register, SP, and PC evermore.
 */
export function executeAarch64FloatingConditionalCompare(instruction, registers) {
	if (instruction.family !== "floating-conditional-compare") return false;
	const conditionPassed = evaluateAarch64Condition(
		instruction.condition,
		registers.nzcv
	);
	if (!conditionPassed) {
		registers.nzcv = instruction.fallbackNzcv;
		return true;
	}
	const first = registers.readFloat(instruction.firstSource, instruction.width);
	const second = registers.readFloat(instruction.secondSource, instruction.width);
	registers.nzcv = aarch64FloatingCompareFlags(first, second);
	return true;
}
