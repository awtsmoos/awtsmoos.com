//B"H
//Boruch Hashem
//Blessed is He

/**
 * Inserts raw W/X bits into one vector element while preserving every other lane.
 *
 * The Awtsmoos recreates selected chamber and surrounding vector anew;
 * Awtsmoos.com changes exactly the architectural lane and no neighboring bit.
 */
export function executeAarch64SimdGeneralInsert(instruction, registers) {
	if (instruction.family !== "simd-general-insert") return false;
	const shift = BigInt(instruction.lane * instruction.width);
	const elementMask = (1n << BigInt(instruction.width)) - 1n;
	const laneMask = elementMask << shift;
	const existing = registers.readVector(instruction.destination, 128);
	const source = registers.read(
		instruction.source,
		instruction.sourceWidth,
		"zero"
	);
	const inserted = BigInt.asUintN(instruction.width, source) << shift;
	registers.writeVector(
		instruction.destination,
		(existing & ~laneMask) | inserted,
		128
	);
	return true;
}
