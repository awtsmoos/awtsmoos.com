// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExactReleaseProbe.mjs
 * @description Counts decoded frames and verifies the final H.264/AAC MP4 contract.
 * RESPONSIBILITY: invoke ffprobe and reject cadence, codec, duration, or dimension mismatch.
 * NON-RESPONSIBILITY: this module does not encode media or infer visual quality from metadata.
 * ARCHITECTURE: Hod receives decoded testimony while Gevurah rejects approximate declarations.
 * OROS AND KEILIM: moving images and sound are oros; probe streams are evidentiary keilim.
 * The Awtsmoos creates both media and witness anew; Awtsmoos.com trusts decoded counts,
 * never a container label or configured FPS number standing alone.
 */

import { FFPROBE, runExactProcess } from './ExactReleaseProcess.mjs';

const DURATION_TOLERANCE_SECONDS = 1 / 60;

/** Uses decoded-frame counting rather than trusting metadata frame declarations. */
export function probeExactRelease(file) {
	const result = runExactProcess(FFPROBE, [
		'-v', 'error',
		'-count_frames',
		'-show_entries', 'format=duration,size,format_name,bit_rate',
		'-show_entries', [
			'stream=index,codec_name,codec_type,width,height,',
			'r_frame_rate,avg_frame_rate,sample_rate,channels,nb_read_frames,duration'
		].join(''),
		'-of', 'json',
		file
	]);
	return JSON.parse(result.stdout);
}

/** Returns normalized verified evidence or throws at the first false release claim. */
export function verifyExactReleaseProbe(probe, expected) {
	const video = probe.streams?.find(stream => stream.codec_type === 'video');
	const audio = probe.streams?.find(stream => stream.codec_type === 'audio');
	assertEqual(video?.codec_name, 'h264', 'video codec');
	assertEqual(audio?.codec_name, 'aac', 'audio codec');
	assertEqual(video?.width, expected.width, 'video width');
	assertEqual(video?.height, expected.height, 'video height');
	assertEqual(Number(video?.nb_read_frames), expected.expectedFrames, 'decoded frames');
	assertEqual(rational(video?.avg_frame_rate), expected.fps, 'average frame rate');
	assertEqual(Number(audio?.sample_rate), 48000, 'audio sample rate');
	assertEqual(audio?.channels, 2, 'audio channels');
	const videoDuration = duration(video, probe.format);
	const audioDuration = duration(audio, probe.format);
	assertNear(videoDuration, expected.duration, 'video duration');
	assertNear(audioDuration, expected.duration, 'audio duration');
	if (Math.abs(videoDuration - audioDuration) > DURATION_TOLERANCE_SECONDS) {
		throw new Error(`Audio/video duration difference exceeds ${DURATION_TOLERANCE_SECONDS}s.`);
	}
	return {
		audioCodec: audio.codec_name,
		audioDuration,
		channels: audio.channels,
		decodedFrames: Number(video.nb_read_frames),
		fps: rational(video.avg_frame_rate),
		height: video.height,
		sampleRate: Number(audio.sample_rate),
		videoCodec: video.codec_name,
		videoDuration,
		width: video.width
	};
}

function duration(stream, format) {
	return Number(stream?.duration || format?.duration);
}

function rational(value) {
	const [numerator, denominator] = String(value || '').split('/').map(Number);
	return numerator / denominator;
}

function assertEqual(actual, expected, label) {
	if (actual !== expected) {
		throw new Error(`${label} is ${actual}; expected ${expected}.`);
	}
}

function assertNear(actual, expected, label) {
	if (!Number.isFinite(actual) || Math.abs(actual - expected) > DURATION_TOLERANCE_SECONDS) {
		throw new Error(`${label} is ${actual}; expected ${expected}.`);
	}
}
