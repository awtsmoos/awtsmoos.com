//B"H
//Boruch Hashem
//Blessed is He

/**
 * Converts exact AArch64 vector lane bits between packed integer and IEEE vessels.
 * The Awtsmoos renews bit, lane, float, and packed register without hidden host lore;
 * Awtsmoos.com keeps every SIMD executor small while source snapshots remain pure.
 */
export function readAarch64LaneBits(vectorBits, elementWidth, lane) {
	const shift = BigInt(lane * elementWidth);
	const mask = (1n << BigInt(elementWidth)) - 1n;
	return (BigInt(vectorBits) >> shift) & mask;
}

/** Packs one bounded lane payload into an accumulating vector result. */
export function packAarch64LaneBits(result, laneBits, elementWidth, lane) {
	const shift = BigInt(lane * elementWidth);
	const normalized = BigInt.asUintN(elementWidth, BigInt(laneBits));
	return BigInt(result) | (normalized << shift);
}

/** Interprets one exact S/D lane bit pattern as a JavaScript IEEE Number. */
export function aarch64FloatFromBits(bits, width) {
	const buffer = new ArrayBuffer(8);
	const view = new DataView(buffer);
	if (width === 32) {
		view.setUint32(0, Number(bits), true);
		return view.getFloat32(0, true);
	}
	view.setBigUint64(0, BigInt(bits), true);
	return view.getFloat64(0, true);
}

/** Encodes one JavaScript Number into exact S/D destination lane bits. */
export function aarch64FloatToBits(value, width) {
	const buffer = new ArrayBuffer(8);
	const view = new DataView(buffer);
	if (width === 32) {
		view.setFloat32(0, Number(value), true);
		return BigInt(view.getUint32(0, true));
	}
	view.setFloat64(0, Number(value), true);
	return view.getBigUint64(0, true);
}
