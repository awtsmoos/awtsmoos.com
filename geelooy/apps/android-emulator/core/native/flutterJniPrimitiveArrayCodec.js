//B"H
//Boruch Hashem
//Blessed be He

/**
 * Encodes one Java primitive into little-endian guest-native bytes.
 * AArch64 Android is little-endian, while Java array values retain their signed,
 * unsigned-char, floating, and 64-bit distinctions before crossing JNI memory.
 */
export function encodeJniPrimitiveValue(spec, value) {
	const bytes = new Uint8Array(spec.bytes);
	const view = new DataView(bytes.buffer);
	writeValue(view, spec.kind, value);
	return bytes;
}

/** Decodes one primitive from a native byte span back into Dalvik array storage. */
export function decodeJniPrimitiveValue(spec, bytes, offset = 0) {
	const view = new DataView(
		bytes.buffer,
		bytes.byteOffset + Number(offset),
		spec.bytes
	);
	return readValue(view, spec.kind);
}

/** Returns a safe host byte count for one typed JNI element span. */
export function jniPrimitiveSpanBytes(spec, count) {
	const length = Number(count);
	const total = length * spec.bytes;
	if (!Number.isSafeInteger(length) || length < 0 || !Number.isSafeInteger(total)) {
		throw codecError("JNI_PRIMITIVE_ARRAY_BYTE_COUNT", `${count}:${spec.bytes}`);
	}
	return total;
}

function writeValue(view, kind, value) {
	if (kind === "boolean") return view.setUint8(0, value ? 1 : 0);
	if (kind === "byte") return view.setInt8(0, signedNumber(value, 8));
	if (kind === "char") return view.setUint16(0, unsignedNumber(value, 16), true);
	if (kind === "short") return view.setInt16(0, signedNumber(value, 16), true);
	if (kind === "int") return view.setInt32(0, signedNumber(value, 32), true);
	if (kind === "long") {
		view.setBigInt64(0, BigInt.asIntN(64, BigInt(value)), true);
		return;
	}
	if (kind === "float") return view.setFloat32(0, Number(value), true);
	if (kind === "double") return view.setFloat64(0, Number(value), true);
	throw codecError("JNI_PRIMITIVE_ARRAY_KIND", kind);
}

function readValue(view, kind) {
	if (kind === "boolean") return view.getUint8(0) === 0 ? 0 : 1;
	if (kind === "byte") return view.getInt8(0);
	if (kind === "char") return view.getUint16(0, true);
	if (kind === "short") return view.getInt16(0, true);
	if (kind === "int") return view.getInt32(0, true);
	if (kind === "long") return view.getBigInt64(0, true);
	if (kind === "float") return view.getFloat32(0, true);
	if (kind === "double") return view.getFloat64(0, true);
	throw codecError("JNI_PRIMITIVE_ARRAY_KIND", kind);
}

function signedNumber(value, bits) {
	return Number(BigInt.asIntN(bits, BigInt(value)));
}

function unsignedNumber(value, bits) {
	return Number(BigInt.asUintN(bits, BigInt(value)));
}

function codecError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
