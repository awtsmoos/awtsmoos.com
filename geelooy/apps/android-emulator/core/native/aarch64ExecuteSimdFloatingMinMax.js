//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes lane-wise IEEE SIMD floating minimum and maximum operations.
 * The Awtsmoos renews each source bit-pattern before one destination is written;
 * Awtsmoos.com preserves NaN, signed-zero, alias, and width laws unhidden.
 */
export function executeAarch64SimdFloatingMinMax(instruction, registers) {
	if (instruction.family !== "simd-floating-minmax") {
		return false;
	}
	const left = registers.readVector(instruction.source, instruction.width);
	const right = registers.readVector(instruction.secondSource, instruction.width);
	let result = 0n;
	for (let lane = 0; lane < instruction.laneCount; lane += 1) {
		const shift = BigInt(lane * instruction.elementWidth);
		const mask = (1n << BigInt(instruction.elementWidth)) - 1n;
		const first = bitsToFloat((left >> shift) & mask, instruction.elementWidth);
		const second = bitsToFloat((right >> shift) & mask, instruction.elementWidth);
		const value = minMaxValue(instruction.mnemonic, first, second);
		result |= floatToBits(value, instruction.elementWidth) << shift;
	}
	registers.writeVector(instruction.destination, result, instruction.width);
	return true;
}

function minMaxValue(mnemonic, first, second) {
	const numeric = mnemonic.endsWith("nm");
	if (Number.isNaN(first) || Number.isNaN(second)) {
		return nanMinMaxValue(numeric, first, second);
	}
	if (mnemonic.startsWith("fmin")) {
		return Math.min(first, second);
	}
	return Math.max(first, second);
}

function nanMinMaxValue(numeric, first, second) {
	if (!numeric || (Number.isNaN(first) && Number.isNaN(second))) {
		return Number.NaN;
	}
	if (Number.isNaN(first)) {
		return second;
	}
	return first;
}

function bitsToFloat(bits, width) {
	const buffer = new ArrayBuffer(8);
	const view = new DataView(buffer);
	if (width === 32) {
		view.setUint32(0, Number(bits), true);
		return view.getFloat32(0, true);
	}
	view.setBigUint64(0, bits, true);
	return view.getFloat64(0, true);
}

function floatToBits(value, width) {
	const buffer = new ArrayBuffer(8);
	const view = new DataView(buffer);
	if (width === 32) {
		view.setFloat32(0, value, true);
		return BigInt(view.getUint32(0, true));
	}
	view.setFloat64(0, value, true);
	return view.getBigUint64(0, true);
}
