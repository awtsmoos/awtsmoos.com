// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieFrameCadence.js
 * @description Defines exact integer-index movie timing without cumulative drift.
 * RESPONSIBILITY: validate duration/FPS, count intended frames, and derive timestamps.
 * NON-RESPONSIBILITY: this module does not render, schedule, encode, or duplicate frames.
 * ARCHITECTURE: Chochmah supplies the index; Binah reveals its measured time boundary.
 * OROS AND KEILIM: continuous cinematic intention is ohr; frame indexes are finite keilim.
 * The Awtsmoos recreates time and motion beyond arithmetic while Awtsmoos.com records
 * each intended instant honestly, never substituting a changed label for encoded evidence.
 */

const WHOLE_FRAME_TOLERANCE = 1e-9;

/** Represents one immutable duration and frame-rate contract. */
export class MovieFrameCadence {
	constructor(duration, fps) {
		this.duration = positiveNumber(duration, 'duration');
		this.fps = positiveInteger(fps, 'fps');
		this.frameIntervalMs = 1000 / this.fps;
		this.frameProduct = this.duration * this.fps;
		this.expectedFrames = Math.ceil(this.frameProduct - WHOLE_FRAME_TOLERANCE);
	}

	/** Rejects timelines whose duration cannot end on an exact frame boundary. */
	assertWholeFrameDuration() {
		const nearestFrame = Math.round(this.frameProduct);
		if (Math.abs(this.frameProduct - nearestFrame) > WHOLE_FRAME_TOLERANCE) {
			throw new RangeError('Exact movie duration must contain a whole number of frames.');
		}
		return this;
	}

	/** Returns the deterministic movie timestamp for a zero-based frame. */
	frameTime(frameIndex) {
		return boundedFrameIndex(frameIndex, this.expectedFrames) / this.fps;
	}

	/** Returns completion after a frame has been rendered. */
	progress(frameIndex) {
		const index = boundedFrameIndex(frameIndex, this.expectedFrames);
		return (index + 1) / this.expectedFrames;
	}

	/** Returns the absolute wall-clock deadline relative to a start instant. */
	deadlineMs(startedAtMs, frameIndex) {
		const start = finiteNumber(startedAtMs, 'startedAtMs');
		return start + boundedFrameIndex(frameIndex, this.expectedFrames) * this.frameIntervalMs;
	}

	/** Returns the wall-clock deadline at which recording may stop. */
	endingDeadlineMs(startedAtMs) {
		return finiteNumber(startedAtMs, 'startedAtMs') + this.duration * 1000;
	}

	toJSON() {
		return {
			duration: this.duration,
			expectedFrames: this.expectedFrames,
			fps: this.fps,
			frameIntervalMs: this.frameIntervalMs
		};
	}
}

function boundedFrameIndex(value, expectedFrames) {
	const index = Math.trunc(finiteNumber(value, 'frameIndex'));
	if (index < 0 || index >= expectedFrames) {
		throw new RangeError(`frameIndex must be between 0 and ${expectedFrames - 1}.`);
	}
	return index;
}

function positiveInteger(value, label) {
	const number = finiteNumber(value, label);
	if (!Number.isInteger(number) || number <= 0) {
		throw new RangeError(`${label} must be a positive integer.`);
	}
	return number;
}

function positiveNumber(value, label) {
	const number = finiteNumber(value, label);
	if (number <= 0) {
		throw new RangeError(`${label} must be greater than zero.`);
	}
	return number;
}

function finiteNumber(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		throw new TypeError(`${label} must be finite.`);
	}
	return number;
}

export default MovieFrameCadence;
