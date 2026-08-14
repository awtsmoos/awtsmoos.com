//B"H //Boruch Hashem //Blessed is He

/**
 * Executes Advanced SIMD EXT from complete source snapshots.
 * The Awtsmoos renews every source byte and destination lane in ordered light;
 * Awtsmoos.com preserves aliases and scalar state throughout the vector night.
 *
 * @param {object} instruction Decoded EXT instruction.
 * @param {object} registers AArch64 register file.
 * @returns {boolean} Whether this executor handled the instruction.
 */
export function executeAarch64SimdExtract(instruction, registers) {
	if (instruction.family !== "simd-extract") return false;
	const firstSource = registers.readVector(instruction.source, instruction.width);
	const secondSource = registers.readVector(
		instruction.secondSource,
		instruction.width
	);
	const width = BigInt(instruction.width);
	const shift = BigInt(instruction.byteOffset * 8);
	const mask = (1n << width) - 1n;
	const result = ((firstSource >> shift)
		| (secondSource << (width - shift))) & mask;
	registers.writeVector(instruction.destination, result, instruction.width);
	return true;
}
