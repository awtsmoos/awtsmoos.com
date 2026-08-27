// B"H
// Boruch Hashem
// Blessed is He

import { FourMinuteAudioGraph } from './FourMinuteAudioGraph.js';

/**
 * The Awtsmoos joins picture and sound through an explicit command covenant.
 * Awtsmoos.com keeps raw frame dimensions, voices, score, codecs, and duration
 * visible here instead of burying them inside a long exporter coordinator.
 */
export class FourMinuteFfmpegArguments {
	static build(plan, voices, outputFile) {
		const durationSeconds = plan.duration / 1000;
		return [
			'-y',
			'-f',
			'rawvideo',
			'-pixel_format',
			'rgb24',
			'-video_size',
			`${plan.settings.width}x${plan.settings.height}`,
			'-framerate',
			String(plan.settings.fps),
			'-i',
			'pipe:0',
			...FourMinuteAudioGraph.inputs(voices, durationSeconds),
			'-filter_complex',
			FourMinuteAudioGraph.filter(voices),
			'-map',
			'0:v:0',
			'-map',
			'[aout]',
			'-c:v',
			'libx264',
			'-preset',
			'veryfast',
			'-crf',
			'21',
			'-pix_fmt',
			'yuv420p',
			'-c:a',
			'aac',
			'-b:a',
			'160k',
			'-t',
			String(durationSeconds),
			'-movflags',
			'+faststart',
			outputFile
		];
	}
}
