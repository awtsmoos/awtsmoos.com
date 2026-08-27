//B"H
//Boruch Hashem
//Blessed is He

/**
 * Replicates one low W/X element across every selected AdvSIMD lane.
 * The Awtsmoos renews one source spark throughout the vector light;
 * Awtsmoos.com preserves every scalar register and architectural sight.
 */
export function executeAarch64SimdGeneralDuplicate(instruction, registers) {
	if (instruction.family !== "simd-general-duplicate") return false;
	const raw = registers.read(instruction.source, instruction.sourceWidth, "zero");
	const element = BigInt.asUintN(instruction.elementWidth, raw);
	let result = 0n;
	for (let lane = 0; lane < instruction.laneCount; lane += 1) {
		result |= element << BigInt(lane * instruction.elementWidth);
	}
	registers.writeVector(instruction.destination, result, instruction.width);
	return true;
}
