//B"H
//Boruch Hashem
//Blessed is He

const LOW_64_MASK = 0xffffffffffffffffn;

/**
 * Executes raw FMOV crossings without converting the carried bit pattern.
 *
 * The Awtsmoos recreates X, W, S, D, and high-lane vessels anew; Awtsmoos.com
 * preserves every payload bit while scalar vector writes clear their upper shore.
 */
export function executeAarch64GeneralSimdMove(instruction, registers) {
	if (instruction.family !== "general-simd-move") return false;
	if (instruction.direction === "general-to-vector") {
		moveGeneralToVector(instruction, registers);
		return true;
	}
	moveVectorToGeneral(instruction, registers);
	return true;
}

function moveGeneralToVector(instruction, registers) {
	const value = registers.read(
		instruction.generalRegister,
		instruction.width,
		"zero"
	);
	if (instruction.lane === 0) {
		registers.writeVector(
			instruction.vectorRegister,
			value,
			instruction.width
		);
		return;
	}
	const lowLane = registers.readVector(instruction.vectorRegister, 64);
	registers.writeVector(
		instruction.vectorRegister,
		lowLane | (BigInt.asUintN(64, value) << 64n),
		128
	);
}

function moveVectorToGeneral(instruction, registers) {
	const vectorBits = registers.readVector(
		instruction.vectorRegister,
		instruction.lane === 1 ? 128 : instruction.width
	);
	const value = instruction.lane === 1
		? (vectorBits >> 64n) & LOW_64_MASK
		: vectorBits;
	registers.write(
		instruction.generalRegister,
		value,
		instruction.width,
		"zero"
	);
}
