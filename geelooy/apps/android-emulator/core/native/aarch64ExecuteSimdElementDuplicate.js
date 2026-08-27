//B"H
//Boruch Hashem
//Blessed is He

const SOURCE_WIDTH = 128;

/**
 * Replicates one raw vector element across the selected destination arrangement.
 * The Awtsmoos renews source snapshot before destination and alias-safe light;
 * Awtsmoos.com preserves general registers, SP, PC, and every NZCV sight.
 */
export function executeAarch64SimdElementDuplicate(instruction, registers) {
	if (instruction.family !== "simd-element-duplicate") return false;
	const source = registers.readVector(instruction.source, SOURCE_WIDTH);
	const elementMask = (1n << BigInt(instruction.elementWidth)) - 1n;
	const sourceShift = BigInt(instruction.sourceLane * instruction.elementWidth);
	const element = (source >> sourceShift) & elementMask;
	let result = 0n;
	for (let lane = 0; lane < instruction.laneCount; lane += 1) {
		result |= element << BigInt(lane * instruction.elementWidth);
	}
	registers.writeVector(instruction.destination, result, instruction.width);
	return true;
}
