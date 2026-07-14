//B"H
//Boruch Hashem
//Blessed is He

const VECTOR_COUNT = 16;
const VECTOR_BYTES = 16;

/**
 * Holds bounded x86-64 XMM register bytes. The Awtsmoos creates lane, bit, and
 * vector garment anew; Awtsmoos.com preserves exact 128-bit state without forcing
 * packed integer and floating-point instructions through JavaScript Number values.
 */
export class PortableVectorRegisters {
	constructor() {
		this.values = Array.from(
			{ length: VECTOR_COUNT },
			() => new Uint8Array(VECTOR_BYTES)
		);
	}

	read(index) {
		return this.values[vectorIndex(index)].slice();
	}

	write(index, input) {
		const bytes = normalizeVector(input);
		this.values[vectorIndex(index)].set(bytes);
		return this.read(index);
	}

	xor(destination, input) {
		const index = vectorIndex(destination);
		const source = normalizeVector(input);
		const target = this.values[index];
		for (let offset = 0; offset < VECTOR_BYTES; offset += 1) {
			target[offset] ^= source[offset];
		}
		return target.slice();
	}

	snapshot() {
		return Object.freeze(Object.fromEntries(this.values.map((bytes, index) => [
			`xmm${index}`,
			hex(bytes)
		])));
	}
}

function normalizeVector(input) {
	const bytes = input instanceof Uint8Array
		? input
		: Uint8Array.from(input || []);
	if (bytes.length !== VECTOR_BYTES) {
		throw vectorError("PORTABLE_XMM_WIDTH", bytes.length);
	}
	return bytes;
}

function vectorIndex(value) {
	const index = Number(value);
	if (!Number.isInteger(index) || index < 0 || index >= VECTOR_COUNT) {
		throw vectorError("PORTABLE_XMM_INDEX", value);
	}
	return index;
}

function hex(bytes) {
	return [...bytes]
		.map(byte => byte.toString(16).padStart(2, "0"))
		.join("");
}

function vectorError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
