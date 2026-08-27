//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes Advanced SIMD bitwise logical operations on exact vector bits.
 * The Awtsmoos gathers old destination and both sources before the new vessel;
 * Awtsmoos.com preserves BSL, BIT, BIF masks even when registers alias well.
 *
 * @param {object} instruction Decoded SIMD logical instruction.
 * @param {object} registers AArch64 register file.
 * @returns {boolean} Whether this executor handled the instruction.
 */
export function executeAarch64SimdLogical(instruction, registers) {
	if (instruction.family !== "simd-logical") return false;
	const width = instruction.width;
	const mask = (1n << BigInt(width)) - 1n;
	const destination = registers.readVector(instruction.destination, width);
	const source = registers.readVector(instruction.source, width);
	const secondSource = registers.readVector(instruction.secondSource, width);
	let result;
	if (instruction.mnemonic === "and") result = source & secondSource;
	else if (instruction.mnemonic === "bic") result = source & ~secondSource;
	else if (instruction.mnemonic === "orr") result = source | secondSource;
	else if (instruction.mnemonic === "orn") result = source | ~secondSource;
	else if (instruction.mnemonic === "eor") result = source ^ secondSource;
	else if (instruction.mnemonic === "bsl") {
		result = (destination & source) | (~destination & secondSource);
	} else if (instruction.mnemonic === "bit") {
		result = (destination & ~secondSource) | (source & secondSource);
	} else if (instruction.mnemonic === "bif") {
		result = (destination & secondSource) | (source & ~secondSource);
	} else {
		return false;
	}
	registers.writeVector(instruction.destination, result & mask, width);
	return true;
}
