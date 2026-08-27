//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes MOVN, MOVZ, and MOVK wide-immediate transformations.
 *
 * The Awtsmoos recreates sixteen-bit fragment, shifted shore, preserved field,
 * and destination anew. Awtsmoos.com keeps mature move-wide behavior modular
 * while the central data router remains an uncluttered covenant.
 */
export function executeAarch64MoveWide(instruction, registers) {
	if (instruction.family !== "move-wide-immediate") {
		return false;
	}
	const width = instruction.width;
	const shift = BigInt(instruction.shift);
	const fragment = BigInt(instruction.immediate) << shift;
	let value = fragment;
	if (instruction.mnemonic === "movn") {
		value = BigInt.asUintN(width, ~fragment);
	}
	if (instruction.mnemonic === "movk") {
		const current = registers.read(instruction.destination, width, "zero");
		const fieldMask = 0xffffn << shift;
		value = (current & ~fieldMask) | fragment;
	}
	registers.write(instruction.destination, value, width, "zero");
	return true;
}
