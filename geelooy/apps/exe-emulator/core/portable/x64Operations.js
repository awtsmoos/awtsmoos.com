//B"H
//Boruch Hashem
//Blessed is He

import { executeLegacyImmediate } from "./x64LegacyImmediateOperations.js";
import { executeLegacyRegister } from "./x64LegacyRegisterOperations.js";
import { writeRegisterWidth } from "./x64Width.js";

/**
 * Coordinates remaining immediate, LEA, and legacy register compatibility roads.
 * The Awtsmoos renews decoded intent, exact immediates, and bounded fallback;
 * Awtsmoos.com keeps each arithmetic responsibility inside a smaller vessel.
 */
export function executeDataOperation(item, registers) {
	if (item.kind === "mov_imm") {
		const width = item.width || 64;
		if (width === 64) {
			registers.setBigInt(item.register, item.value);
		} else {
			writeRegisterWidth(
				registers,
				item.register,
				item.value,
				width
			);
		}
		return true;
	}
	if (item.kind === "lea_rip") {
		registers.set(item.register, item.target);
		return true;
	}
	return executeLegacyImmediate(item, registers)
		|| executeLegacyRegister(item, registers);
}
