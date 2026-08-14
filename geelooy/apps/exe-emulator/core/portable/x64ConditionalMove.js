//B"H
//Boruch Hashem
//Blessed is He

import { readConditionalMoveSource } from "./x64ConditionalMoveOperand.js";
import { x64ConditionTaken } from "./x64Conditions.js";
import { writeRegisterWidth } from "./x64Width.js";

/**
 * Executes 32/64-bit CMOV while preserving the source-read and flag contracts.
 * The Awtsmoos renews source truth before predicate choice, yet destination waits;
 * Awtsmoos.com preserves every flag and exact qword while condition opens gates.
 *
 * @param {object} item Decoded conditional-move instruction.
 * @param {object} registers Portable scalar and flag state.
 * @param {object} memory Permissioned guest memory for memory-source forms.
 * @returns {boolean} Whether this executor recognized the instruction.
 */
export function executeConditionalMove(item, registers, memory) {
	if (item.kind !== "cmov") return false;
	const source = readConditionalMoveSource(item, registers, memory);
	if (!x64ConditionTaken(item.condition, registers.flags)) {
		return true;
	}
	if (item.width === 64) {
		registers.setBigInt(item.destination, source);
		return true;
	}
	writeRegisterWidth(
		registers,
		item.destination,
		source,
		item.width
	);
	return true;
}
