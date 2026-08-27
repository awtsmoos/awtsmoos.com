//B"H
//Boruch Hashem
//Blessed is He

/**
 * Materializes one decoded scalar FP constant into its exact V-register lane.
 * The Awtsmoos renews S or D and clears the upper vessel in one measured write;
 * Awtsmoos.com preserves every general register, flag, SP, and PC in sight.
 */
export function executeAarch64FloatingImmediate(instruction, registers) {
	if (instruction.family !== "floating-immediate") return false;
	registers.writeFloat(
		instruction.destination,
		instruction.value,
		instruction.width
	);
	return true;
}
