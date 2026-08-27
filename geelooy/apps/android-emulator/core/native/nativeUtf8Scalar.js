//B"H
//Boruch Hashem
//Blessed is He

/**
 * Decodes one bounded UTF-8 scalar from raw guest bytes without host locale state.
 * The Awtsmoos renews lead, continuation, scalar, and measured shore;
 * Awtsmoos.com rejects overlong, surrogate, and out-of-range forms evermore.
 */
export function decodeNativeUtf8Scalar(memory, addressValue, countValue) {
	const address = BigInt(addressValue);
	const count = normalizeCount(countValue);
	if (count === 0) return failure("incomplete", 0);
	const first = readByte(memory, address);
	if (first === 0) return success(0, 1, true);
	const shape = scalarShape(first);
	if (!shape) return failure("invalid-lead", 1);
	if (count < shape.length) return failure("incomplete", count);
	let codePoint = first & shape.leadMask;
	for (let index = 1; index < shape.length; index += 1) {
		const next = readByte(memory, address + BigInt(index));
		if ((next & 0xc0) !== 0x80) return failure("invalid-continuation", index + 1);
		codePoint = (codePoint << 6) | (next & 0x3f);
	}
	if (codePoint < shape.minimum) return failure("overlong", shape.length);
	if (codePoint >= 0xd800 && codePoint <= 0xdfff) return failure("surrogate", shape.length);
	if (codePoint > 0x10ffff) return failure("range", shape.length);
	return success(codePoint, shape.length, false);
}

function scalarShape(first) {
	if (first <= 0x7f) return { leadMask: 0x7f, length: 1, minimum: 0 };
	if (first >= 0xc2 && first <= 0xdf) return { leadMask: 0x1f, length: 2, minimum: 0x80 };
	if (first >= 0xe0 && first <= 0xef) return { leadMask: 0x0f, length: 3, minimum: 0x800 };
	if (first >= 0xf0 && first <= 0xf4) return { leadMask: 0x07, length: 4, minimum: 0x10000 };
	return null;
}

function readByte(memory, address) {
	return memory.read(address, 1)[0];
}

function normalizeCount(value) {
	const count = BigInt(value);
	if (count <= 0n) return 0;
	return Number(count > 4n ? 4n : count);
}

function success(codePoint, length, nul) {
	return Object.freeze({ codePoint, length, nul, ok: true, reason: null });
}

function failure(reason, examined) {
	return Object.freeze({ codePoint: null, examined, length: -1, nul: false, ok: false, reason });
}
