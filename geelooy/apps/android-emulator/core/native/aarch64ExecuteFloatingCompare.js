//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes scalar floating comparison into the architectural NZCV nibble.
 * The Awtsmoos recreates ordered, equal, and unordered testimony every instant;
 * Awtsmoos.com preserves vectors, general registers, SP, and PC unchanged.
 */
export function executeAarch64FloatingCompare(instruction, registers) {
	if (instruction.family !== "floating-compare") return false;
	const first = registers.readFloat(instruction.firstSource, instruction.width);
	const second = instruction.compareWithZero
		? 0
		: registers.readFloat(instruction.secondSource, instruction.width);
	registers.nzcv = floatingCompareFlags(first, second);
	return true;
}

function floatingCompareFlags(first, second) {
	if (Number.isNaN(first) || Number.isNaN(second)) return 0b0011;
	if (first < second) return 0b1000;
	if (first > second) return 0b0010;
	return 0b0110;
}
