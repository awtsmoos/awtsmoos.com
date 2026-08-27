//B"H
//Boruch Hashem
//Blessed is He

/**
 * Describes and expands every integer Advanced SIMD modified immediate.
 * The Awtsmoos recreates cmode, lane, shift, inversion, and arrangement anew;
 * Awtsmoos.com leaves floating cmode fifteen outside this measured family.
 */
export function describeSimdModifiedImmediate(cmodeValue, opValue, qValue) {
	const cmode = Number(cmodeValue);
	const op = Number(opValue);
	const width = Number(qValue) === 1 ? 128 : 64;
	if (cmode < 0 || cmode > 14 || (op !== 0 && op !== 1)) return null;
	if (cmode === 14) return describeByteImmediate(op, width);
	if (cmode >= 12) {
		return createDescription({
			cmode,
			elementWidth: 32,
			mnemonic: op === 1 ? "mvni" : "movi",
			operation: "replace",
			shift: cmode === 12 ? 8 : 16,
			shiftMode: "msl",
			width
		});
	}
	const halfword = cmode >= 8;
	const elementWidth = halfword ? 16 : 32;
	const localCmode = halfword ? cmode - 8 : cmode;
	const combine = (localCmode & 1) === 1;
	const shift = Math.floor(localCmode / 2) * 8;
	return createDescription({
		cmode,
		elementWidth,
		mnemonic: combine
			? op === 1 ? "bic" : "orr"
			: op === 1 ? "mvni" : "movi",
		operation: combine ? op === 1 ? "bic" : "or" : "replace",
		shift,
		shiftMode: "lsl",
		width
	});
}

export function expandSimdModifiedImmediate(immediateValue, description) {
	const immediate = BigInt(Number(immediateValue) & 0xff);
	if (description.shiftMode === "byte-mask") {
		return expandByteMaskImmediate(Number(immediate));
	}
	let lane = immediate << BigInt(description.shift);
	if (description.shiftMode === "msl") {
		lane |= (1n << BigInt(description.shift)) - 1n;
	}
	if (description.mnemonic === "mvni") {
		lane = BigInt.asUintN(description.elementWidth, ~lane);
	}
	return BigInt.asUintN(description.elementWidth, lane);
}

export function replicateSimdModifiedImmediate(laneValue, elementWidth, width) {
	const lane = BigInt.asUintN(elementWidth, BigInt(laneValue));
	let result = 0n;
	for (let offset = 0; offset < width; offset += elementWidth) {
		result |= lane << BigInt(offset);
	}
	return BigInt.asUintN(width, result);
}

export function expandByteMaskImmediate(immediateValue) {
	const immediate = Number(immediateValue) & 0xff;
	let lane = 0n;
	for (let byte = 0; byte < 8; byte += 1) {
		if (((immediate >>> byte) & 1) === 1) lane |= 0xffn << BigInt(byte * 8);
	}
	return lane;
}

function describeByteImmediate(op, width) {
	if (op === 1) {
		return createDescription({
			cmode: 14,
			elementWidth: 64,
			mnemonic: "movi",
			operation: "replace",
			shift: 0,
			shiftMode: "byte-mask",
			width
		});
	}
	return createDescription({
		cmode: 14,
		elementWidth: 8,
		mnemonic: "movi",
		operation: "replace",
		shift: 0,
		shiftMode: "lsl",
		width
	});
}

function createDescription(detail) {
	return Object.freeze({
		...detail,
		arrangement: `${detail.width / detail.elementWidth}${laneLetter(detail.elementWidth)}`,
		laneCount: detail.width / detail.elementWidth
	});
}

function laneLetter(width) {
	return ({ 8: "b", 16: "h", 32: "s", 64: "d" })[width];
}
