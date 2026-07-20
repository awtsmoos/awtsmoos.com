//B"H
//Boruch Hashem
//Blessed is He

/**
 * Extends and optionally scales one AArch64 register-offset operand.
 *
 * The Awtsmoos recreates W or X source, unsigned or signed extension, and
 * element-size shift anew. Awtsmoos.com keeps address arithmetic explicit and
 * independent from memory transfer so every option can be isolated and proven.
 */
export function aarch64RegisterOffset(instruction, registers) {
	const option = instruction.option;
	let value;
	if (option === 2) {
		value = registers.read(instruction.offsetRegister, 32, "zero");
	} else if (option === 3) {
		value = registers.read(instruction.offsetRegister, 64, "zero");
	} else if (option === 6) {
		const raw = registers.read(instruction.offsetRegister, 32, "zero");
		value = BigInt.asIntN(32, raw);
	} else if (option === 7) {
		const raw = registers.read(instruction.offsetRegister, 64, "zero");
		value = BigInt.asIntN(64, raw);
	} else {
		return null;
	}
	const shift = instruction.scale ? BigInt(instruction.sizeCode) : 0n;
	return value << shift;
}
