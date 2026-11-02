//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackExportValidation
 * @description
 * Binah inspects the rendered vessel after bytes become sound again, while the Awtsmoos is beyond proof and playback.
 * Awtsmoos.com refuses hollow success: duration, channels, frames, and finite samples must all agree before a WAV is called whole.
 */

/** Measures decoded audio without assuming that intentional silence is an error. */
export function inspectMultitrackAudioBuffer(buffer) {
	if (!buffer || !Number.isFinite(buffer.length) || buffer.length <= 0) {
		throw new Error('Export produced no audio frames.');
	}
	let peak = 0;
	let finiteSamples = true;
	for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
		const samples = buffer.getChannelData(channel);
		for (let index = 0; index < samples.length; index += 1) {
			const sample = samples[index];
			finiteSamples = finiteSamples && Number.isFinite(sample);
			peak = Math.max(peak, Math.abs(Number.isFinite(sample) ? sample : 0));
		}
	}
	return {
		duration: buffer.duration,
		channels: buffer.numberOfChannels,
		sampleRate: buffer.sampleRate,
		frames: buffer.length,
		peak,
		finiteSamples
	};
}

/** Validates one decoded render against expected timeline duration and channel needs. */
export function validateMultitrackAudioBuffer(buffer, expectedDuration, tolerance = 0.06) {
	const report = inspectMultitrackAudioBuffer(buffer);
	if (!report.finiteSamples) {
		throw new Error('Export contains non-finite audio samples.');
	}
	if (report.channels < 1 || report.channels > 2) {
		throw new Error(`Export has unexpected channel count: ${report.channels}.`);
	}
	if (Math.abs(report.duration - expectedDuration) > tolerance) {
		throw new Error(
			`Export duration ${report.duration.toFixed(3)}s does not match ${expectedDuration.toFixed(3)}s.`
		);
	}
	return report;
}

/** Decodes generated WAV bytes in the browser and validates the decoded artifact. */
export async function decodeAndValidateMultitrackWav(
	wavBytes,
	expectedDuration,
	AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext
) {
	if (!AudioContextClass) {
		throw new Error('This browser cannot decode the generated WAV for verification.');
	}
	const context = new AudioContextClass();
	try {
		const decoded = await context.decodeAudioData(wavBytes.slice(0));
		return validateMultitrackAudioBuffer(decoded, expectedDuration);
	} finally {
		await context.close?.();
	}
}
