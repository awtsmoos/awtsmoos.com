//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MicSafety
 * @description
 * The Awtsmoos gives the singer a voice and the room a boundary;
 * Awtsmoos.com keeps one shared law for microphone, monitor and feedback
 * on both the piano surface and the Studio, so the rule can never fork.
 * Pure logic only — no DOM, no audio nodes — so Node tests can prove it.
 */

/** Output modes a singer can confirm for a session. */
export const MIC_OUTPUT_MODES = ['headphones', 'speakers'];

/** localStorage key shared by the piano surface and the Studio. */
export const MIC_OUTPUT_MODE_KEY = 'awtsmoos.micOutputMode';

/**
 * Normalizes a stored/chosen output mode. The safe default is speakers:
 * until the user confirms headphones, monitoring stays impossible.
 * @param {*} value - Raw mode value.
 * @returns {string} 'headphones' or 'speakers'.
 */
export function normalizeOutputMode(value) {
	return value === 'headphones' ? 'headphones' : 'speakers';
}

/**
 * Monitoring (hearing yourself through the output) is only ever allowed
 * on headphones, where the mic cannot hear the speakers.
 * @param {*} mode - Output mode.
 * @returns {boolean} Whether monitoring may be enabled at all.
 */
export function canEnableMonitor(mode) {
	return normalizeOutputMode(mode) === 'headphones';
}

/**
 * The single gate every surface must use: a monitor request is honored
 * only when the user explicitly asked AND the mode allows it.
 * @param {*} requested - What the user toggled.
 * @param {*} mode - Output mode.
 * @returns {boolean} Effective monitor state.
 */
export function resolveMonitorEnabled(requested, mode) {
	return Boolean(requested) && canEnableMonitor(mode);
}

/**
 * Builds getUserMedia constraints for a mode. Echo cancellation and
 * noise suppression are always on — on speakers they are the first
 * line of defence against the room feeding back into the take.
 * @param {*} mode - Output mode.
 * @param {Object} [options] - autoGainControl defaults to true.
 * @returns {Object} MediaStreamConstraints for audio capture.
 */
export function buildMicConstraints(mode, options = {}) {
	return {
		audio: {
			echoCancellation: true,
			noiseSuppression: true,
			autoGainControl: options.autoGainControl !== false
		}
	};
}

/**
 * Total alignment compensation for a recorded take, in seconds.
 * The singer performs against playback heard outputLatency late, and
 * the microphone digitizes inputLatency late; both shift the take.
 * @param {Object} parts - Latency parts in seconds.
 * @returns {number} Non-negative total compensation.
 */
export function totalLatencyCompensation(parts = {}) {
	const output = Number(parts.outputLatency) || Number(parts.baseLatency) || 0;
	const input = Number(parts.inputLatency) || 0;
	return Math.max(0, output) + Math.max(0, input);
}

/**
 * Places a captured buffer on the timeline.
 * timeline(t) = t + playhead + (captureStart - playbackStart) - comp,
 * where t is seconds into the captured buffer. A negative start trims
 * the buffer head into sourceOffset instead of placing before zero.
 * @param {Object} input - Placement inputs in seconds.
 * @returns {{timelineStart:number, sourceOffset:number, duration:number, compensation:number}}
 */
export function placeRecordedClip(input = {}) {
	const compensation = totalLatencyCompensation(input);
	const captured = Math.max(0, Number(input.capturedDuration) || 0);
	// Buffer sample t was digitized at captureStart + t and sounded
	// inputLatency earlier; against a transport whose playhead sat at
	// transportStart when its clock read playbackStart, its honest
	// timeline position is t + transportStart + (captureStart -
	// playbackStart) - compensation.
	const rawStart = (Number(input.transportStart) || 0)
		+ ((Number(input.captureStartContextTime) || 0) - (Number(input.playbackStartContextTime) || 0))
		- compensation;
	const timelineStart = Math.max(0, rawStart);
	const sourceOffset = Math.max(0, -rawStart);
	return {
		timelineStart,
		sourceOffset,
		duration: Math.max(0, captured - sourceOffset),
		compensation
	};
}

/** Converts a ducking amount in decibels to a linear gain factor. */
export function duckFactorFromDb(db) {
	const amount = Number(db) || 0;
	return Math.pow(10, amount / 20);
}

/**
 * Conservative feedback guard. It watches the mic input only while
 * monitoring is live — the one path that can howl — and cuts the
 * MONITOR (never the recording) when a sustained near-clipping,
 * high-energy signal holds for the sustain window: the signature of
 * a feedback ring, not of singing, whose peaks move and breathe.
 */
export class FeedbackGuard {
	constructor(options = {}) {
		this.rmsThreshold = options.rmsThreshold ?? 0.55;
		this.peakThreshold = options.peakThreshold ?? 0.98;
		this.sustainMs = options.sustainMs ?? 300;
		this.dangerSince = null;
		this.cut = false;
	}

	/** Clears a previous cut; only an explicit user action may call this. */
	reset() {
		this.cut = false;
		this.dangerSince = null;
	}

	/**
	 * Feeds one analysis block.
	 * @param {Object} block - {rms, peak, monitoring, nowMs}.
	 * @returns {string} 'ok' or 'cut'.
	 */
	feed(block = {}) {
		if (this.cut) return 'cut';
		if (!block.monitoring) {
			this.dangerSince = null;
			return 'ok';
		}
		const dangerous = (Number(block.peak) || 0) >= this.peakThreshold && (Number(block.rms) || 0) >= this.rmsThreshold;
		if (!dangerous) {
			this.dangerSince = null;
			return 'ok';
		}
		const now = Number(block.nowMs) || 0;
		if (this.dangerSince === null) this.dangerSince = now;
		if (now - this.dangerSince >= this.sustainMs) {
			this.cut = true;
			return 'cut';
		}
		return 'ok';
	}
}

/** Maps getUserMedia failures to honest, user-readable messages. */
export function micErrorMessage(error) {
	const name = error?.name || '';
	if (name === 'NotAllowedError' || name === 'SecurityError')
		return 'Microphone permission was denied. Allow microphone access in the browser, then try again.';
	if (name === 'NotFoundError' || name === 'OverconstrainedError')
		return 'No microphone was found on this device.';
	if (name === 'NotReadableError')
		return 'The microphone is busy in another app. Close it there, then try again.';
	return `Microphone could not start: ${error?.message || 'unknown error'}`;
}
