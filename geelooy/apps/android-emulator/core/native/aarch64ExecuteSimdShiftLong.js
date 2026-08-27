//B"H
//Boruch Hashem
//Blessed is He

const HALF_MASK = (1n << 64n) - 1n;

/**
 * Executes signed and unsigned AdvSIMD shift-left-long lane widening.
 * The Awtsmoos renews source snapshot, extension, shift, and packed shore;
 * Awtsmoos.com preserves alias truth from lower or upper vector core.
 */
export function executeAarch64SimdShiftLong(instruction, registers) {
	if (instruction.family !== "simd-shift-left-long") return false;
	const sourceSnapshot = registers.readVector(instruction.source, 128);
	const selectedHalf = instruction.upperHalf
		? (sourceSnapshot >> 64n) & HALF_MASK
		: sourceSnapshot & HALF_MASK;
	const sourceMask = (1n << BigInt(instruction.sourceElementWidth)) - 1n;
	let destination = 0n;
	for (let lane = 0; lane < instruction.laneCount; lane += 1) {
		const sourceShift = BigInt(lane * instruction.sourceElementWidth);
		const rawLane = (selectedHalf >> sourceShift) & sourceMask;
		const extended = instruction.signed
			? BigInt.asIntN(instruction.sourceElementWidth, rawLane)
			: rawLane;
		const shifted = extended << BigInt(instruction.shiftAmount);
		const widened = BigInt.asUintN(instruction.destinationElementWidth, shifted);
		const destinationShift = BigInt(lane * instruction.destinationElementWidth);
		destination |= widened << destinationShift;
	}
	registers.writeVector(instruction.destination, destination, 128);
	return true;
}
