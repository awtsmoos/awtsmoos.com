// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieIvfWriter.js
 * @description Collects one bounded VP8 segment and emits auditable IVF body bytes.
 * RESPONSIBILITY: copy recyclable chunks, preserve global timestamps, and release segments.
 * NON-RESPONSIBILITY: this module does not configure encoders or join multiple segments.
 * ARCHITECTURE: Yesod gathers encoded sparks before Malchus manifests a bounded blob.
 * OROS AND KEILIM: VP8 payloads are oros; frame records and segment receipts are keilim.
 * The Awtsmoos renews every encoded spark beyond storage; Awtsmoos.com keeps global
 * indexes intact when a long movie is divided into smaller memory-safe vessels.
 */

import {
	createIvfFileHeader,
	createIvfFrameHeader
} from './MovieIvfHeader.js';

const MICROSECONDS_PER_SECOND = 1000000;

/** Collects VP8 chunks for one exact frame range. */
export class MovieIvfWriter {
	constructor(options) {
		this.fps = positiveInteger(options.fps, 'fps');
		this.height = positiveInteger(options.height, 'height');
		this.startFrame = nonnegativeInteger(options.startFrame || 0, 'startFrame');
		this.width = positiveInteger(options.width, 'width');
		this.frames = [];
	}

	/** Copies one encoded chunk before the browser recycles its storage. */
	addChunk(chunk) {
		const data = new Uint8Array(chunk.byteLength);
		chunk.copyTo(data);
		this.frames.push({
			data,
			timestamp: BigInt(this.resolveFrameIndex(chunk)),
			type: String(chunk.type || 'unknown')
		});
	}

	/** Returns one complete single-segment IVF blob. */
	toBlob() {
		return new Blob([
			createIvfFileHeader(this.headerOptions(this.frames.length)),
			...this.bodyParts()
		], {
			type: 'video/x-ivf'
		});
	}

	/** Releases a body-only segment and clears copied frame payload references. */
	releaseSegment(range) {
		const encodedFrames = range.endFrameExclusive - range.startFrame;
		if (this.frames.length !== encodedFrames) {
			throw new RangeError(`Segment expected ${encodedFrames} chunks but received ${this.frames.length}.`);
		}
		const segment = {
			blob: new Blob(this.bodyParts(), { type: 'application/octet-stream' }),
			encodedFrames,
			endFrameExclusive: range.endFrameExclusive,
			firstTimestamp: Number(this.frames[0]?.timestamp ?? range.startFrame),
			lastTimestamp: Number(this.frames.at(-1)?.timestamp ?? range.startFrame),
			segmentIndex: range.segmentIndex,
			startFrame: range.startFrame,
			startsWithKeyFrame: this.frames[0]?.type === 'key'
		};
		this.frames = [];
		return segment;
	}

	bodyParts() {
		return this.frames.flatMap(frame => [
			createIvfFrameHeader(frame.data.byteLength, frame.timestamp),
			frame.data
		]);
	}

	headerOptions(frameCount) {
		return {
			fps: this.fps,
			frameCount,
			height: this.height,
			width: this.width
		};
	}

	resolveFrameIndex(chunk) {
		if (chunk.timestamp == null) {
			return this.startFrame + this.frames.length;
		}
		return Math.round(Number(chunk.timestamp) * this.fps / MICROSECONDS_PER_SECOND);
	}
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

export default MovieIvfWriter;
