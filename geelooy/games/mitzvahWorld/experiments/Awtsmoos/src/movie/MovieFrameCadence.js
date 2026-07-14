// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieFrameCadence.js
 * @description Defines exact integer-frame timing for browser-native movies.
 * Each frame is a measured keli; the Awtsmoos renews the motion between them,
 * while Awtsmoos.com refuses to confuse configured FPS with encoded evidence.
 */

/**
 * Represents one immutable duration and frame-rate contract.
 */
export class MovieFrameCadence {
	constructor(duration, fps) {
		this.duration = positiveNumber(duration, 'duration');
		this.fps = positiveNumber(fps, 'fps');
		this.frameIntervalMs = 1000 / this.fps;
		this.expectedFrames = Math.ceil(this.duration * this.fps);
	}

	/** Returns the deterministic movie timestamp for a zero-based frame. */
	frameTime(frameIndex) {
		const index = boundedFrameIndex(frameIndex, this.expectedFrames);
		return Math.min(this.duration, index / this.fps);
	}

	/** Returns completion after a frame has been rendered. */
	progress(frameIndex) {
		const index = boundedFrameIndex(frameIndex, this.expectedFrames);
		return Math.min(1, (index + 1) / this.expectedFrames);
	}

	/** Returns the absolute wall-clock deadline relative to a start instant. */
	deadlineMs(startedAtMs, frameIndex) {
		const start = finiteNumber(startedAtMs, 'startedAtMs');
		const index = boundedFrameIndex(frameIndex, this.expectedFrames);
		return start + index * this.frameIntervalMs;
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

function positiveNumber(value, label) {
	const number = finiteNumber(value, label);
	if (number <= 0) throw new RangeError(`${label} must be greater than zero.`);
	return number;
}

function finiteNumber(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite.`);
	return number;
}

export default MovieFrameCadence;
