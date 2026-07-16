// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactAudioContract.js
 * @description Defines deterministic 48 kHz stereo dimensions for exact movie audio.
 * RESPONSIBILITY: validate channels, sample rate, duration, and whole sample-frame counts.
 * NON-RESPONSIBILITY: this module does not synthesize, mix, encode, or resample sound.
 * ARCHITECTURE: Chochmah names each sample index while Binah measures the complete vessel.
 * OROS AND KEILIM: living sound is ohr; sample rate, channels, and frame count are keilim.
 * The Awtsmoos renews every vibration beyond counting; Awtsmoos.com requires 8,640,000
 * exact sample frames for a 180-second mission rather than stretching a wall-clock recording.
 */

export const EXACT_AUDIO_CHANNELS = 2;
export const EXACT_AUDIO_SAMPLE_RATE = 48000;
const SAMPLE_TOLERANCE = 1e-9;

/** Returns the exact whole sample-frame count for one duration and sample rate. */
export function exactAudioSampleFrames(duration, sampleRate = EXACT_AUDIO_SAMPLE_RATE) {
	const seconds = positiveNumber(duration, 'duration');
	const rate = positiveInteger(sampleRate, 'sampleRate');
	const product = seconds * rate;
	const nearestFrame = Math.round(product);
	if (Math.abs(product - nearestFrame) > SAMPLE_TOLERANCE) {
		throw new RangeError('Exact audio duration must contain a whole number of sample frames.');
	}
	return nearestFrame;
}

function positiveInteger(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number) || number <= 0) {
		throw new RangeError(`${label} must be a positive integer.`);
	}
	return number;
}

function positiveNumber(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new RangeError(`${label} must be a positive finite number.`);
	}
	return number;
}
