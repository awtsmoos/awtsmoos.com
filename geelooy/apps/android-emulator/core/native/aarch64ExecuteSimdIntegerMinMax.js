//B"H //Boruch Hashem //Blessed is He

/**
 * Executes signed and unsigned lane-wise SIMD minimum and maximum.
 * The Awtsmoos renews raw bits, interpreted value, and chosen lane in light;
 * Awtsmoos.com preserves aliases and scalar state throughout the vector rite.
 *
 * @param {object} instruction Decoded integer min/max instruction.
 * @param {object} registers AArch64 register file.
 * @returns {boolean} Whether this executor handled the instruction.
 */
export function executeAarch64SimdIntegerMinMax(instruction, registers) {
	if (instruction.family !== "simd-integer-minmax") return false;
	const left = registers.readVector(instruction.source, instruction.width);
	const right = registers.readVector(instruction.secondSource, instruction.width);
	const laneMask = (1n << BigInt(instruction.elementWidth)) - 1n;
	let result = 0n;
	for (let lane = 0; lane < instruction.laneCount; lane += 1) {
		const shift = BigInt(lane * instruction.elementWidth);
		const leftRaw = (left >> shift) & laneMask;
		const rightRaw = (right >> shift) & laneMask;
		const leftValue = interpreted(leftRaw, instruction);
		const rightValue = interpreted(rightRaw, instruction);
		const chooseLeft = instruction.minimum
			? leftValue <= rightValue
			: leftValue >= rightValue;
		result |= (chooseLeft ? leftRaw : rightRaw) << shift;
	}
	registers.writeVector(instruction.destination, result, instruction.width);
	return true;
}

function interpreted(rawLane, instruction) {
	return instruction.signed
		? BigInt.asIntN(instruction.elementWidth, rawLane)
		: rawLane;
}
