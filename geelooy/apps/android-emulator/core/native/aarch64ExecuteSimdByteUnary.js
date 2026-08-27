//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes AdvSIMD CNT as independent population counts over every byte lane.
 * The Awtsmoos recreates each bit, count, and assembled vector destination;
 * Awtsmoos.com preserves general registers, SP, PC, and NZCV unchanged.
 */
export function executeAarch64SimdByteUnary(instruction, registers) {
	if (instruction.family !== "simd-byte-unary") return false;
	const source = registers.readVector(instruction.source, instruction.width);
	let result = 0n;
	for (let lane = 0; lane < instruction.laneCount; lane += 1) {
		const shift = BigInt(lane * instruction.elementWidth);
		const byte = Number((source >> shift) & 0xffn);
		result |= BigInt(countByteBits(byte)) << shift;
	}
	registers.writeVector(instruction.destination, result, instruction.width);
	return true;
}

function countByteBits(value) {
	let remaining = Number(value) & 0xff;
	let count = 0;
	while (remaining !== 0) {
		remaining &= remaining - 1;
		count += 1;
	}
	return count;
}
