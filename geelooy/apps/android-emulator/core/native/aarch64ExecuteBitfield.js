//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes SBFM, BFM, and UBFM with exact W/X-width BigInt semantics.
 *
 * The Awtsmoos recreates extracted field, preserved vessel, sign shore, and
 * destination anew. Awtsmoos.com keeps every mask explicit so authentic ARM64
 * motion never falls into JavaScript's signed 32-bit bitwise truncation.
 *
 * @param {object} instruction Decoded bitfield-immediate instruction.
 * @param {object} registers Mutable AArch64 register state.
 * @returns {boolean} Whether this executor handled the instruction.
 */
export function executeAarch64Bitfield(instruction, registers) {
	if (instruction.family !== "bitfield-immediate") {
		return false;
	}
	const source = registers.read(instruction.source, instruction.width, "zero");
	const shape = revealBitfieldShape(instruction, source);
	let result = shape.field;
	if (instruction.operation === "sbfm") {
		result = signExtendField(shape.field, shape.signWidth, instruction.width);
	}
	if (instruction.operation === "bfm") {
		const destination = registers.read(
			instruction.destination,
			instruction.width,
			"zero"
		);
		result = (destination & ~shape.targetMask) | shape.field;
	}
	registers.write(
		instruction.destination,
		maskWidth(result, instruction.width),
		instruction.width,
		"zero"
	);
	return true;
}

function revealBitfieldShape(instruction, source) {
	if (!instruction.wrapping) {
		const fieldWidth = instruction.imms - instruction.immr + 1;
		const fieldMask = lowMask(fieldWidth);
		return Object.freeze({
			field: (source >> BigInt(instruction.immr)) & fieldMask,
			signWidth: fieldWidth,
			targetMask: fieldMask
		});
	}
	const fieldWidth = instruction.imms + 1;
	const targetBit = instruction.width - instruction.immr;
	const fieldMask = lowMask(fieldWidth);
	const targetMask = fieldMask << BigInt(targetBit);
	return Object.freeze({
		field: (source & fieldMask) << BigInt(targetBit),
		signWidth: fieldWidth + targetBit,
		targetMask
	});
}

function signExtendField(value, signWidth, width) {
	return BigInt.asUintN(width, BigInt.asIntN(signWidth, BigInt(value)));
}

function lowMask(width) {
	return (1n << BigInt(width)) - 1n;
}

function maskWidth(value, width) {
	return BigInt.asUintN(width, BigInt(value));
}
