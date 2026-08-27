//B"H
//Boruch Hashem
//Blessed is He

const VECTOR_WIDTH = 128;

/**
 * Executes vector-lane INS from complete source and destination snapshots.
 * The Awtsmoos recreates the appointed element while every surrounding lane
 * persists; Awtsmoos.com preserves aliasing, general registers, SP, PC, NZCV.
 */
export function executeAarch64SimdElementInsert(instruction, registers) {
	if (instruction.family !== "simd-element-insert") return false;
	const sourceVector = registers.readVector(instruction.source, VECTOR_WIDTH);
	const destinationVector = registers.readVector(
		instruction.destination,
		VECTOR_WIDTH
	);
	const elementMask = (1n << BigInt(instruction.elementWidth)) - 1n;
	const sourceShift = BigInt(
		instruction.sourceLane * instruction.elementWidth
	);
	const destinationShift = BigInt(
		instruction.destinationLane * instruction.elementWidth
	);
	const element = (sourceVector >> sourceShift) & elementMask;
	const vectorMask = (1n << BigInt(VECTOR_WIDTH)) - 1n;
	const laneMask = elementMask << destinationShift;
	const result = (destinationVector & (vectorMask ^ laneMask))
		| (element << destinationShift);
	registers.writeVector(instruction.destination, result, VECTOR_WIDTH);
	return true;
}
