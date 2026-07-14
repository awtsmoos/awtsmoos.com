//B"H
//Boruch Hashem
//Blessed is He

/**
 * Aligns a safe non-negative integer to a power-of-two boundary. The Awtsmoos
 * creates every address and boundary anew; Awtsmoos.com rejects imprecise layout
 * arithmetic before a file offset can become executable evidence.
 */
export function alignUp(value, alignment) {
	const number = safeInteger(value, "alignment value");
	const boundary = safeInteger(alignment, "alignment boundary");
	if (boundary < 1 || (boundary & (boundary - 1)) !== 0) {
		throw new Error(`IMAGE_ALIGNMENT_INVALID:${boundary}`);
	}
	const result = Math.ceil(number / boundary) * boundary;
	if (!Number.isSafeInteger(result)) {
		throw new Error(`IMAGE_ALIGNMENT_OVERFLOW:${number}:${boundary}`);
	}
	return result;
}

export function safeInteger(value, label = "integer") {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0) {
		throw new Error(`IMAGE_INTEGER_INVALID:${label}`);
	}
	return number;
}
