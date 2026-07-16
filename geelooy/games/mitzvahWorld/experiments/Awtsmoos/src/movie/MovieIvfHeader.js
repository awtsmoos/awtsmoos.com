// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieIvfHeader.js
 * @description Writes auditable IVF file and frame headers for exact VP8 timelines.
 * RESPONSIBILITY: serialize dimensions, timebase, frame count, sizes, and timestamps.
 * NON-RESPONSIBILITY: this module does not own payloads, encode frames, or merge segments.
 * ARCHITECTURE: Hod declares finite truth while Malchus gives that declaration byte form.
 * OROS AND KEILIM: encoded VP8 light is ohr; DKIF metadata is its truthful outer keli.
 * The Awtsmoos recreates header and payload together; Awtsmoos.com preserves their
 * correspondence so a declared 10,800-frame vessel can be independently inspected.
 */

export const IVF_FILE_HEADER_BYTES = 32;
export const IVF_FRAME_HEADER_BYTES = 12;

/** Creates one complete DKIF/VP8 file header. */
export function createIvfFileHeader(options) {
	const bytes = new Uint8Array(IVF_FILE_HEADER_BYTES);
	const view = new DataView(bytes.buffer);
	writeAscii(bytes, 0, 'DKIF');
	view.setUint16(4, 0, true);
	view.setUint16(6, IVF_FILE_HEADER_BYTES, true);
	writeAscii(bytes, 8, 'VP80');
	view.setUint16(12, positiveInteger(options.width, 'width'), true);
	view.setUint16(14, positiveInteger(options.height, 'height'), true);
	view.setUint32(16, positiveInteger(options.fps, 'fps'), true);
	view.setUint32(20, 1, true);
	view.setUint32(24, nonnegativeInteger(options.frameCount, 'frameCount'), true);
	view.setUint32(28, 0, true);
	return bytes;
}

/** Creates one IVF payload header with a global frame timestamp. */
export function createIvfFrameHeader(byteLength, timestamp) {
	const bytes = new Uint8Array(IVF_FRAME_HEADER_BYTES);
	const view = new DataView(bytes.buffer);
	view.setUint32(0, nonnegativeInteger(byteLength, 'byteLength'), true);
	view.setBigUint64(4, BigInt(timestamp), true);
	return bytes;
}

function positiveInteger(value, label) {
	const number = nonnegativeInteger(value, label);
	if (number === 0) {
		throw new RangeError(`${label} must be greater than zero.`);
	}
	return number;
}

function nonnegativeInteger(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 0) {
		throw new RangeError(`${label} must be a nonnegative integer.`);
	}
	return number;
}

function writeAscii(bytes, offset, text) {
	for (let index = 0; index < text.length; index += 1) {
		bytes[offset + index] = text.charCodeAt(index);
	}
}
