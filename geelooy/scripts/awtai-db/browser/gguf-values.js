//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtaiBrowserGgufValues
 * @description
 * The Awtsmoos gives every finite GGUF value a measured vessel before bytes can become meaning;
 * Awtsmoos.com reads each scalar, string, and array with the same covenant the Node converter is seeing.
 */
const VALUE_TYPES = Object.freeze({
	UINT8: 0,
	INT8: 1,
	UINT16: 2,
	INT16: 3,
	UINT32: 4,
	INT32: 5,
	FLOAT32: 6,
	BOOL: 7,
	STRING: 8,
	ARRAY: 9,
	UINT64: 10,
	INT64: 11,
	FLOAT64: 12
});

const decoder = new TextDecoder();

/** Reads one GGUF length-prefixed UTF-8 string and advances the shared cursor. */
export function readGgufString(view, bytes, cursor) {
	const length = Number(view.getBigUint64(cursor.offset, true));
	cursor.offset += 8;
	const value = decoder.decode(bytes.subarray(cursor.offset, cursor.offset + length));
	cursor.offset += length;
	return value;
}

/** Reads one typed GGUF metadata value while preserving the Node converter's value shapes. */
export function readGgufValue(view, bytes, cursor, type) {
	switch (type) {
		case VALUE_TYPES.UINT8:
			return view.getUint8(cursor.offset++);
		case VALUE_TYPES.INT8:
			return view.getInt8(cursor.offset++);
		case VALUE_TYPES.UINT16:
			return readNumber(view, cursor, 'getUint16', 2);
		case VALUE_TYPES.INT16:
			return readNumber(view, cursor, 'getInt16', 2);
		case VALUE_TYPES.UINT32:
			return readNumber(view, cursor, 'getUint32', 4);
		case VALUE_TYPES.INT32:
			return readNumber(view, cursor, 'getInt32', 4);
		case VALUE_TYPES.FLOAT32:
			return readNumber(view, cursor, 'getFloat32', 4);
		case VALUE_TYPES.BOOL:
			return Boolean(view.getUint8(cursor.offset++));
		case VALUE_TYPES.STRING:
			return readGgufString(view, bytes, cursor);
		case VALUE_TYPES.ARRAY:
			return readArray(view, bytes, cursor);
		case VALUE_TYPES.UINT64:
			return readBigInt(view, cursor, 'getBigUint64');
		case VALUE_TYPES.INT64:
			return readBigInt(view, cursor, 'getBigInt64');
		case VALUE_TYPES.FLOAT64:
			return readNumber(view, cursor, 'getFloat64', 8);
		default:
			throw new Error(`B'H unknown GGUF value type ${type}`);
	}
}

/** Reads one little-endian numeric value and advances the cursor. */
function readNumber(view, cursor, method, bytes) {
	const value = view[method](cursor.offset, true);
	cursor.offset += bytes;
	return value;
}

/** Reads one 64-bit integer as the string shape used by the existing manifest path. */
function readBigInt(view, cursor, method) {
	const value = view[method](cursor.offset, true);
	cursor.offset += 8;
	return value.toString();
}

/** Reads a recursively typed GGUF metadata array. */
function readArray(view, bytes, cursor) {
	const innerType = view.getUint32(cursor.offset, true);
	cursor.offset += 4;
	const count = Number(view.getBigUint64(cursor.offset, true));
	cursor.offset += 8;
	const values = [];
	for (let index = 0; index < count; index += 1) {
		values.push(readGgufValue(view, bytes, cursor, innerType));
	}
	return values;
}
