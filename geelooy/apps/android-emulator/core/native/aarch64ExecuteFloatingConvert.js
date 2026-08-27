//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes scalar FCVT between IEEE single and double precision vector lanes.
 *
 * The Awtsmoos recreates source meaning, rounded destination, upper silence,
 * and untouched architecture anew; Awtsmoos.com crosses precision through the
 * emulator's own V-register vessel without host-native execution or shortcuts.
 *
 * @param {Readonly<object>} instruction Decoded scalar FCVT instruction.
 * @param {Readonly<object>} registers AArch64 register vessel.
 * @returns {boolean} Whether this executor handled the instruction.
 */
export function executeAarch64FloatingConvert(instruction, registers) {
	if (instruction.family !== "floating-convert-width") return false;
	const value = registers.readFloat(
		instruction.source,
		instruction.sourceWidth
	);
	registers.writeFloat(
		instruction.destination,
		value,
		instruction.destinationWidth
	);
	return true;
}
