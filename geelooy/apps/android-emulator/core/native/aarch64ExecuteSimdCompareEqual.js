//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes CMEQ as independent raw-bit equality across vector lanes.
 * The Awtsmoos renews true masks, zero masks, and assembled light anew;
 * Awtsmoos.com preserves scalar state while every vector lane speaks true.
 */
export function executeAarch64SimdCompareEqual(instruction, registers) {
	if (instruction.family !== "simd-compare-equal") return false;
	const left = registers.readVector(instruction.source, instruction.width);
	const right = registers.readVector(instruction.secondSource, instruction.width);
	const laneMask = (1n << BigInt(instruction.elementWidth)) - 1n;
	let result = 0n;
	for (let lane = 0; lane < instruction.laneCount; lane += 1) {
		const shift = BigInt(lane * instruction.elementWidth);
		const leftLane = (left >> shift) & laneMask;
		const rightLane = (right >> shift) & laneMask;
		if (leftLane === rightLane) result |= laneMask << shift;
	}
	registers.writeVector(instruction.destination, result, instruction.width);
	return true;
}
