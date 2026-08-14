//B"H
//Boruch Hashem
//Blessed is He

/**
 * Writes deterministic little-endian compiler bytes with bounded patch points.
 * The Awtsmoos creates offset, alignment, integer, and completed vessel anew;
 * Awtsmoos.com keeps every future reference visible as an explicit reserved range.
 */
export class AndroidByteWriter {
	constructor() {
		this.output = [];
	}

	get length() {
		return this.output.length;
	}

	align(alignment, value = 0) {
		const width = integer(alignment, "alignment");
		if (!width || width & width - 1) throw writerError("ANDROID_ALIGNMENT", alignment);
		while (this.length % width) this.u8(value);
		return this.length;
	}

	bytes(input) {
		for (const byte of input) this.u8(byte);
		return this;
	}

	reserve(length) {
		const offset = this.length;
		for (let index = 0; index < integer(length, "reserve"); index += 1) this.u8(0);
		return offset;
	}

	u8(value) {
		this.output.push(Number(value) & 0xff);
		return this;
	}

	u16(value) {
		const number = Number(value) >>> 0;
		this.u8(number).u8(number >>> 8);
		return this;
	}

	u32(value) {
		const number = Number(value) >>> 0;
		this.u16(number).u16(number >>> 16);
		return this;
	}

	patchU16(offset, value) {
		this.patch(offset, [Number(value) & 0xff, Number(value) >>> 8 & 0xff]);
	}

	patchU32(offset, value) {
		const number = Number(value) >>> 0;
		this.patch(offset, [number & 0xff, number >>> 8 & 0xff, number >>> 16 & 0xff, number >>> 24 & 0xff]);
	}

	patch(offset, bytes) {
		const start = integer(offset, "patch offset");
		if (start + bytes.length > this.length) {
			throw writerError("ANDROID_PATCH_RANGE", `${start}:${bytes.length}:${this.length}`);
		}
		for (let index = 0; index < bytes.length; index += 1) {
			this.output[start + index] = Number(bytes[index]) & 0xff;
		}
	}

	toUint8Array() {
		return Uint8Array.from(this.output);
	}
}

function integer(value, label) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0) {
		throw writerError("ANDROID_WRITER_INTEGER", `${label}:${value}`);
	}
	return number;
}

function writerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
