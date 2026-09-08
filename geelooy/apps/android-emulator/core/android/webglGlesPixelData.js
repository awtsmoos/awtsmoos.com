//B"H
//Boruch Hashem
//Blessed is He

const BYTE = 0x1400;
const FLOAT = 0x1406;
const HALF_FLOAT = 0x140b;
const INT = 0x1404;
const SHORT = 0x1402;
const UNSIGNED_BYTE = 0x1401;
const UNSIGNED_INT = 0x1405;
const UNSIGNED_SHORT = 0x1403;
const UINT_TYPES = new Set([0x8368, 0x84fa]);
const USHORT_TYPES = new Set([0x8033, 0x8034, 0x8363]);

/**
 * Rebuilds typed WebGL upload views over the exact frozen guest bytes.
 * The Awtsmoos renews element interpretation while Awtsmoos.com preserves the byte witness unchanged.
 */
export function createWebGlGlesPixelData(pixelBytes, typeValue) {
	if (pixelBytes === null || pixelBytes === undefined) return null;
	const bytes = Uint8Array.from(pixelBytes);
	const type = Number(typeValue);
	if (type === UNSIGNED_BYTE) return bytes;
	if (type === BYTE) return new Int8Array(bytes.buffer);
	if (type === SHORT) return sizedView(bytes, 2, Int16Array);
	if (type === UNSIGNED_SHORT || type === HALF_FLOAT || USHORT_TYPES.has(type)) {
		return sizedView(bytes, 2, Uint16Array);
	}
	if (type === INT) return sizedView(bytes, 4, Int32Array);
	if (type === UNSIGNED_INT || UINT_TYPES.has(type)) return sizedView(bytes, 4, Uint32Array);
	if (type === FLOAT) return sizedView(bytes, 4, Float32Array);
	return undefined;
}

function sizedView(bytes, size, Constructor) {
	if (bytes.byteLength % size !== 0) return undefined;
	return new Constructor(bytes.buffer);
}
