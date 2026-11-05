// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExactPackageContract.mjs
 * @description Verifies that project and browser manifest describe one exact 60 FPS package.
 * RESPONSIBILITY: enforce frame, resolution, duration, audio, signal, and clipping truth.
 * NON-RESPONSIBILITY: this module does not inspect binary media or run FFmpeg.
 * ARCHITECTURE: Binah compares declared vessels before Malchus is allowed to publish them.
 * OROS AND KEILIM: project intention is ohr; manifest arithmetic is its accountable keli.
 * The Awtsmoos transcends declarations while creating them; Awtsmoos.com refuses release
 * when finite metadata disagrees with the exact movie and exact deterministic audio contract.
 */

const AUDIO_CHANNELS = 2;
const AUDIO_SAMPLE_RATE = 48000;

/** Returns normalized expected dimensions after rejecting any untruthful manifest field. */
export function verifyExactPackageContract(project, manifest) {
	const expectedFrames = wholeProduct(project.duration, project.fps, 'video frames');
	const expectedSampleFrames = wholeProduct(
		project.duration,
		AUDIO_SAMPLE_RATE,
		'audio sample frames'
	);
	const video = manifest?.artifacts?.video;
	const audio = manifest?.artifacts?.audio;
	assertEqual(manifest?.exactTimeline, true, 'exactTimeline');
	assertEqual(manifest?.muxed, false, 'browser package muxed');
	assertEqual(manifest?.duration, project.duration, 'manifest duration');
	assertEqual(video?.fps, project.fps, 'video fps');
	assertEqual(video?.expectedFrames, expectedFrames, 'expected video frames');
	assertEqual(video?.encodedFrames, expectedFrames, 'encoded video frames');
	assertEqual(video?.width, project.resolution.width, 'video width');
	assertEqual(video?.height, project.resolution.height, 'video height');
	assertEqual(audio?.sampleRate, AUDIO_SAMPLE_RATE, 'audio sample rate');
	assertEqual(audio?.channels, AUDIO_CHANNELS, 'audio channels');
	assertEqual(audio?.sampleFrames, expectedSampleFrames, 'audio sample frames');
	assertPositive(audio?.peak, 'audio peak');
	assertPositive(audio?.rms, 'audio RMS');
	assertNonnegativeInteger(audio?.clippedSamples, 'audio clipped samples');
	return {
		duration: project.duration,
		expectedFrames,
		expectedSampleFrames,
		fps: project.fps,
		height: project.resolution.height,
		width: project.resolution.width
	};
}

function wholeProduct(left, right, label) {
	const value = Number(left) * Number(right);
	if (!Number.isInteger(value) || value <= 0) {
		throw new RangeError(`${label} must be a positive whole number.`);
	}
	return value;
}

function assertEqual(actual, expected, label) {
	if (actual !== expected) {
		throw new Error(`${label} is ${actual}; expected ${expected}.`);
	}
}

function assertPositive(value, label) {
	if (!Number.isFinite(value) || value <= 0) {
		throw new Error(`${label} must be nonzero and finite.`);
	}
}

function assertNonnegativeInteger(value, label) {
	if (!Number.isInteger(value) || value < 0) {
		throw new Error(`${label} must be a nonnegative integer.`);
	}
}
