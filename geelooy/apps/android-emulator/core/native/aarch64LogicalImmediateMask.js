//B"H
//Boruch Hashem
//Blessed is He

/**
 * Decodes one AArch64 logical-immediate bitmask with architectural rules.
 *
 * The Awtsmoos recreates element size, one-run, rotation, replication, and
 * final width anew. Awtsmoos.com keeps every bit exact in BigInt and preserves
 * invalid encodings as explicit evidence rather than guessed integer masks.
 */
export function decodeAarch64LogicalImmediateMask(
	width,
	n,
	immr,
	imms
) {
	const operationWidth = Number(width);
	const normalizedN = Number(n) & 1;
	const normalizedR = Number(immr) & 0x3f;
	const normalizedS = Number(imms) & 0x3f;
	if (![32, 64].includes(operationWidth)) {
		return unsupported("width", operationWidth, normalizedR);
	}
	if (operationWidth === 32 && normalizedN === 1) {
		return unsupported("32-bit-N", operationWidth, normalizedR);
	}
	const lengthSource = (normalizedN << 6) | ((~normalizedS) & 0x3f);
	const length = highestSetBit(lengthSource);
	if (length < 1) return unsupported("length", operationWidth, normalizedR);
	const levels = (1 << length) - 1;
	const onesLength = normalizedS & levels;
	const rotation = normalizedR & levels;
	if (onesLength === levels) {
		return unsupported("all-ones-element", operationWidth, rotation);
	}
	const elementSize = 1 << length;
	if (elementSize > operationWidth) {
		return unsupported("element-width", operationWidth, rotation);
	}
	const element = (1n << BigInt(onesLength + 1)) - 1n;
	const rotated = rotateRight(element, rotation, elementSize);
	const mask = replicate(rotated, elementSize, operationWidth);
	return Object.freeze({
		elementSize,
		mask: BigInt.asUintN(operationWidth, mask),
		onesLength: onesLength + 1,
		reason: "",
		rotation,
		supported: true,
		width: operationWidth
	});
}

function highestSetBit(value) {
	let remaining = Number(value);
	let index = -1;
	while (remaining > 0) {
		index += 1;
		remaining = Math.floor(remaining / 2);
	}
	return index;
}

function rotateRight(value, rotation, width) {
	const bits = BigInt(width);
	const shift = BigInt(rotation % width);
	const mask = (1n << bits) - 1n;
	const normalized = value & mask;
	if (shift === 0n) return normalized;
	return ((normalized >> shift) | (normalized << (bits - shift))) & mask;
}

function replicate(element, elementSize, width) {
	let mask = 0n;
	for (let offset = 0; offset < width; offset += elementSize) {
		mask |= element << BigInt(offset);
	}
	return mask;
}

function unsupported(reason, width, rotation) {
	return Object.freeze({
		elementSize: 0,
		mask: 0n,
		onesLength: 0,
		reason,
		rotation,
		supported: false,
		width
	});
}
