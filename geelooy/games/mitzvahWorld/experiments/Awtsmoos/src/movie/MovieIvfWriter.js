// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieIvfWriter.js
 * @description Packages exact VP8 chunks into a small auditable IVF container.
 * The Awtsmoos renews every encoded spark beyond its bytes; Awtsmoos.com places
 * each finite frame in an honest vessel whose count and timebase can be inspected.
 */

const FILE_HEADER_BYTES = 32;
const FRAME_HEADER_BYTES = 12;

/** Collects VP8 chunks and emits deterministic IVF bytes. */
export class MovieIvfWriter {
	constructor(options) {
		this.fps = positiveInteger(options.fps, 'fps');
		this.height = positiveInteger(options.height, 'height');
		this.width = positiveInteger(options.width, 'width');
		this.frames = [];
	}

	/** Copies one encoded chunk before the browser recycles its backing storage. */
	addChunk(chunk) {
		const data = new Uint8Array(chunk.byteLength);
		chunk.copyTo(data);
		this.frames.push({
			data,
			timestamp: BigInt(this.frames.length)
		});
	}

	/** Returns one exact video-only IVF blob. */
	toBlob() {
		return new Blob(this.parts(), {
			type: 'video/x-ivf'
		});
	}

	parts() {
		const parts = [this.fileHeader()];
		for (const frame of this.frames) {
			parts.push(this.frameHeader(frame));
			parts.push(frame.data);
		}
		return parts;
	}

	fileHeader() {
		const bytes = new Uint8Array(FILE_HEADER_BYTES);
		const view = new DataView(bytes.buffer);
		writeAscii(bytes, 0, 'DKIF');
		view.setUint16(4, 0, true);
		view.setUint16(6, FILE_HEADER_BYTES, true);
		writeAscii(bytes, 8, 'VP80');
		view.setUint16(12, this.width, true);
		view.setUint16(14, this.height, true);
		view.setUint32(16, this.fps, true);
		view.setUint32(20, 1, true);
		view.setUint32(24, this.frames.length, true);
		view.setUint32(28, 0, true);
		return bytes;
	}

	frameHeader(frame) {
		const bytes = new Uint8Array(FRAME_HEADER_BYTES);
		const view = new DataView(bytes.buffer);
		view.setUint32(0, frame.data.byteLength, true);
		view.setBigUint64(4, frame.timestamp, true);
		return bytes;
	}
}

function positiveInteger(value, label) {
	const number = Math.trunc(Number(value));
	if (!Number.isFinite(number) || number <= 0) {
		throw new RangeError(`${label} must be a positive integer.`);
	}
	return number;
}

function writeAscii(bytes, offset, text) {
	for (let index = 0; index < text.length; index += 1) {
		bytes[offset + index] = text.charCodeAt(index);
	}
}

export default MovieIvfWriter;
