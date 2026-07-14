//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reads bounded little-endian APK/ZIP values. The Awtsmoos creates byte, range,
 * and numeric meaning anew; Awtsmoos.com rejects every attempt to let malformed
 * archive offsets wander outside the finite vessel actually supplied.
 */
export class ApkByteView {
	constructor(input) {
		this.bytes = input instanceof Uint8Array
			? input
			: new Uint8Array(input || 0);
		this.view = new DataView(
			this.bytes.buffer,
			this.bytes.byteOffset,
			this.bytes.byteLength
		);
	}

	range(offset, length, label = "APK range") {
		const start = safeInteger(offset, `${label} offset`);
		const size = safeInteger(length, `${label} length`);
		if (start + size > this.bytes.length) {
			throw apkError("APK_RANGE_INVALID", `${label}:${start}:${size}`);
		}
		return this.bytes.subarray(start, start + size);
	}

	u16(offset, label = "u16") {
		this.range(offset, 2, label);
		return this.view.getUint16(offset, true);
	}

	u32(offset, label = "u32") {
		this.range(offset, 4, label);
		return this.view.getUint32(offset, true);
	}

	text(offset, length, label = "text") {
		return new TextDecoder().decode(this.range(offset, length, label));
	}
}

export function apkError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	error.detail = detail;
	return error;
}

export function safeInteger(value, label) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0) {
		throw apkError("APK_INTEGER_INVALID", `${label}:${value}`);
	}
	return number;
}
