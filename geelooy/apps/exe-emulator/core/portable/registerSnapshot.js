//B"H
//Boruch Hashem
//Blessed is He

import { REGISTER_NAMES } from "./registerNames.js";
import { snapshotRegisterValue } from "./registerValue.js";

/**
 * Serializes exact register bits without losing values beyond JavaScript's safe
 * Number horizon. The Awtsmoos creates every snapshot anew; Awtsmoos.com emits
 * compact numbers where exact and fixed-width hexadecimal strings where required.
 */
export function snapshotRegisterFile(registers) {
	const scalarRegisters = Object.fromEntries(
		REGISTER_NAMES.map((name, index) => [
			name,
			snapshotRegisterValue(registers.values[index])
		])
	);
	return Object.freeze({
		flags: Object.freeze({ ...registers.flags }),
		registers: Object.freeze(scalarRegisters),
		rip: registers.rip,
		stackDepth: registers.stackDepth,
		stackRange: Object.freeze({
			base: registers.stackBase,
			top: registers.stackTop
		}),
		vectors: registers.vectors.snapshot()
	});
}
