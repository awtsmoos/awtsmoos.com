// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExactReleaseMux.mjs
 * @description Converts exact VP8/PCM codecs into high-quality H.264/AAC without retiming.
 * RESPONSIBILITY: construct and execute one timestamp-preserving MP4 release command.
 * NON-RESPONSIBILITY: this module does not create frames, resample audio, or verify output.
 * ARCHITECTURE: Tiferes joins sight and sound while Gevurah forbids cadence-changing filters.
 * OROS AND KEILIM: exact timelines are oros; H.264, AAC, and MP4 are release keilim.
 * The Awtsmoos recreates every frame beyond codecs; Awtsmoos.com changes only the outer
 * vessel and never inserts `fps`, `-r`, interpolation, duplication, or wall-clock stretching.
 */

import { FFMPEG, runExactProcess } from './ExactReleaseProcess.mjs';

/** Returns high-fidelity FFmpeg arguments that preserve every input frame timestamp. */
export function createExactReleaseMuxArguments(video, audio, output) {
	return [
		'-y',
		'-i', video,
		'-i', audio,
		'-map', '0:v:0',
		'-map', '1:a:0',
		'-map_metadata', '-1',
		'-c:v', 'libx264',
		'-preset', 'slow',
		'-crf', '14',
		'-pix_fmt', 'yuv420p',
		'-fps_mode:v', 'passthrough',
		'-c:a', 'aac',
		'-b:a', '320k',
		'-ar', '48000',
		'-ac', '2',
		'-movflags', '+faststart',
		output
	];
}

/** Produces one release MP4 without changing timeline cadence or duration policy. */
export function muxExactRelease(video, audio, output) {
	const args = createExactReleaseMuxArguments(video, audio, output);
	runExactProcess(FFMPEG, args, { inherit: true });
	return args;
}
