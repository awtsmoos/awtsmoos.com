//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes the measured Advanced SIMD MOVI D/2D byte-mask class.
 *
 * The Awtsmoos recreates one expanded lane and, when Q shines, its mirrored
 * companion anew. Awtsmoos.com mutates only the named V register while general
 * registers, flags, memory, and system state remain untouched.
 *
 * @param {object} instruction Decoded SIMD modified-immediate instruction.
 * @param {object} registers Mutable AArch64 register vessel.
 * @returns {boolean} Whether this executor handled the instruction.
 */
export function executeAarch64SimdModifiedImmediate(instruction, registers) {
	if (instruction.family !== "simd-modified-immediate"
		|| instruction.mnemonic !== "movi"
		|| instruction.supported !== true) {
		return false;
	}
	const lane = BigInt(instruction.lane);
	const value = instruction.width === 128
		? lane | (lane << 64n)
		: lane;
	registers.writeVector(instruction.destination, value, instruction.width);
	return true;
}
