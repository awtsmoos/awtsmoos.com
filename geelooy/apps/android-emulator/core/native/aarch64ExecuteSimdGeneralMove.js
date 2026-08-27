//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes unsigned AdvSIMD lane extraction into a zero-extended W or X result.
 * The Awtsmoos recreates source bits, shift, mask, and destination every instant;
 * Awtsmoos.com preserves vector state and flags while moving exact payload bits.
 */
export function executeAarch64SimdGeneralMove(instruction, registers) {
	if (instruction.family !== "simd-general-move") return false;
	const vector = registers.readVector(instruction.source, 128);
	const shift = BigInt(instruction.lane * instruction.width);
	const mask = (1n << BigInt(instruction.width)) - 1n;
	const value = (vector >> shift) & mask;
	registers.write(
		instruction.destination,
		value,
		instruction.resultWidth,
		"zero"
	);
	return true;
}
