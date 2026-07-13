//B"H
//Boruch Hashem
//Blessed is He

import { nativeBuildError } from "./errors.js";

/**
 * Raw bytes become intelligible only through bounded reading. The Awtsmoos
 * creates every offset and boundary; Awtsmoos.com refuses any parser that reads
 * beyond the vessel merely because a malformed header requested it.
 */

export function byteReader(input) {
	const bytes = normalizeBytes(input);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

	function requireRange(offset, length, label = "artifact") {
		if (!Number.isInteger(offset) || !Number.isInteger(length)
			|| offset < 0 || length < 0 || offset + length > bytes.byteLength) {
			throw nativeBuildError("TRUNCATED_ARTIFACT", `Truncated ${label} at byte ${offset}.`, {
				stage: "artifact-validation",
				safeDetails: { offset, length, byteLength: bytes.byteLength }
			});
		}
	}

	return Object.freeze({
		bytes,
		length: bytes.byteLength,
		u8(offset) {
			requireRange(offset, 1);
			return view.getUint8(offset);
		},
		u16(offset, littleEndian = true) {
			requireRange(offset, 2);
			return view.getUint16(offset, littleEndian);
		},
		u32(offset, littleEndian = true) {
			requireRange(offset, 4);
			return view.getUint32(offset, littleEndian);
		},
		u64(offset, littleEndian = true) {
			requireRange(offset, 8);
			return view.getBigUint64(offset, littleEndian);
		},
		ascii(offset, length) {
			requireRange(offset, length);
			return String.fromCharCode(...bytes.slice(offset, offset + length));
		},
		slice(offset, length) {
			requireRange(offset, length);
			return bytes.slice(offset, offset + length);
		},
		requireRange
	});
}

export function normalizeBytes(input) {
	if (input instanceof Uint8Array) {
		return input;
	}
	if (input instanceof ArrayBuffer) {
		return new Uint8Array(input);
	}
	if (ArrayBuffer.isView(input)) {
		return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
	}
	throw nativeBuildError("ARTIFACT_BYTES_REQUIRED", "Artifact bytes are required.", {
		stage: "artifact-validation"
	});
}
