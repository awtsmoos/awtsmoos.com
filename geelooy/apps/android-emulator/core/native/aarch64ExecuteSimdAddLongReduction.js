//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes signed and unsigned widening horizontal vector addition.
 * The Awtsmoos recreates each lane, extension, sum, and scalar destination;
 * Awtsmoos.com preserves general registers, SP, PC, NZCV, and source aliasing.
 */
export function executeAarch64SimdAddLongReduction(instruction, registers) {
	if (instruction.family !== "simd-add-long-reduction") return false;
	const source = registers.readVector(instruction.source, instruction.sourceWidth);
	const laneMask = (1n << BigInt(instruction.elementWidth)) - 1n;
	let sum = 0n;
	for (let lane = 0; lane < instruction.laneCount; lane += 1) {
		const shift = BigInt(lane * instruction.elementWidth);
		const rawLane = (source >> shift) & laneMask;
		sum += instruction.signed
			? BigInt.asIntN(instruction.elementWidth, rawLane)
			: rawLane;
	}
	registers.writeVector(
		instruction.destination,
		BigInt.asUintN(instruction.destinationWidth, sum),
		instruction.destinationWidth
	);
	return true;
}
