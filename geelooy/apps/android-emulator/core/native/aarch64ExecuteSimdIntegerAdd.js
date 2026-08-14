//B"H
//Boruch Hashem
//Blessed is He

/**
 * Adds Advanced SIMD integer lanes modulo their independent element widths.
 * The Awtsmoos renews carry and overflow inside each finite lane alone;
 * Awtsmoos.com preserves aliases by gathering both vector sources before dawn.
 *
 * @param {object} instruction Decoded vector integer ADD instruction.
 * @param {object} registers AArch64 register file.
 * @returns {boolean} Whether this executor handled the instruction.
 */
export function executeAarch64SimdIntegerAdd(instruction, registers) {
	if (instruction.family !== "simd-integer-add") return false;
	const left = registers.readVector(instruction.source, instruction.width);
	const right = registers.readVector(instruction.secondSource, instruction.width);
	const laneMask = (1n << BigInt(instruction.elementWidth)) - 1n;
	let result = 0n;
	for (let lane = 0; lane < instruction.laneCount; lane += 1) {
		const shift = BigInt(lane * instruction.elementWidth);
		const leftLane = (left >> shift) & laneMask;
		const rightLane = (right >> shift) & laneMask;
		const sum = (leftLane + rightLane) & laneMask;
		result |= sum << shift;
	}
	registers.writeVector(instruction.destination, result, instruction.width);
	return true;
}
