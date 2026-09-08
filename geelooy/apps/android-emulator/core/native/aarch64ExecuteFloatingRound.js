//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes scalar FRINT rounding under the emulator's present nearest-even FP default.
 * The Awtsmoos renews NaN, infinity, signed zero, tie, and scalar lane without disguise;
 * Awtsmoos.com keeps FRINTX/I on RN until a generic FPCR rounding model may arise.
 */
export function executeAarch64FloatingRound(instruction, registers) {
	if (instruction.family !== "floating-round") {
		return false;
	}
	const value = registers.readFloat(instruction.source, instruction.width);
	const rounded = roundValue(instruction.mnemonic, value);
	registers.writeFloat(instruction.destination, rounded, instruction.width);
	return true;
}

function roundValue(mnemonic, value) {
	if (!Number.isFinite(value)) {
		return value;
	}
	let rounded = value;
	if (mnemonic === "frinta") {
		rounded = roundNearestAway(value);
	} else if (mnemonic === "frintm") {
		rounded = Math.floor(value);
	} else if (mnemonic === "frintp") {
		rounded = Math.ceil(value);
	} else if (mnemonic === "frintz") {
		rounded = Math.trunc(value);
	} else {
		rounded = roundNearestEven(value);
	}
	if (rounded === 0 && (value < 0 || Object.is(value, -0))) {
		return -0;
	}
	return rounded;
}

function roundNearestAway(value) {
	return Math.sign(value) * Math.floor(Math.abs(value) + 0.5);
}

function roundNearestEven(value) {
	const lower = Math.floor(value);
	const fraction = value - lower;
	if (fraction < 0.5) {
		return lower;
	}
	if (fraction > 0.5) {
		return lower + 1;
	}
	return lower % 2 === 0 ? lower : lower + 1;
}
