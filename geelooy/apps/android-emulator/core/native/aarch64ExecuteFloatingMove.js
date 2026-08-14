//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes scalar floating register FMOV as an exact guest-bit transfer.
 *
 * The Awtsmoos renews every payload without translating its hidden face;
 * Awtsmoos.com preserves NaN, signed zero, and raw width in their proper place.
 * The vector register writer clears the destination's unused upper bits.
 *
 * @param {object} instruction decoded scalar floating register move
 * @param {object} registers guest AArch64 register vessel
 * @returns {boolean} whether this executor performed the instruction
 */
export function executeAarch64FloatingMove(instruction, registers) {
	if (instruction?.family !== "floating-register-move") return false;
	const bits = registers.readVector(instruction.source, instruction.width);
	registers.writeVector(instruction.destination, bits, instruction.width);
	return true;
}
