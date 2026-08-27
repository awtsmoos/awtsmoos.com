// B"H
// Boruch Hashem
// Blessed is He

/**
 * Picture and nine delayed voices enter one encoding covenant. The Awtsmoos
 * renews every frame and syllable while Awtsmoos.com binds H.264, AAC, exact
 * duration, fast-start metadata, and the authored sixty-second performance.
 */
export class OneMinuteFfmpegArguments {
	static create(plan, voices, outputFile) {
		const argumentsList = [
			'-y', '-f', 'rawvideo', '-pixel_format', 'rgb24',
			'-video_size', `${plan.settings.width}x${plan.settings.height}`,
			'-framerate', String(plan.settings.fps), '-i', 'pipe:0'
		];
		for (const voice of voices) {
			argumentsList.push('-i', voice.file);
		}
		argumentsList.push('-f', 'lavfi', '-t', '60', '-i', 'anullsrc=r=48000:cl=stereo');
		argumentsList.push(
			'-filter_complex', this.audioFilter(voices),
			'-map', '0:v:0', '-map', '[audio]',
			'-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
			'-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k',
			'-t', '60', '-movflags', '+faststart', outputFile
		);
		return argumentsList;
	}

	static audioFilter(voices) {
		const filters = voices.map((voice, index) => {
			const delay = Math.round(voice.start);
			const seconds = Math.max(0.1, voice.duration / 1000);
			return `[${index + 1}:a]adelay=${delay}|${delay},atrim=duration=${seconds},apad[a${index}]`;
		});
		const bedIndex = voices.length + 1;
		filters.push(`[${bedIndex}:a]atrim=duration=60[bed]`);
		const inputs = voices.map((voice, index) => `[a${index}]`).join('') + '[bed]';
		filters.push(`${inputs}amix=inputs=${voices.length + 1}:duration=longest:normalize=0,alimiter=limit=0.9[audio]`);
		return filters.join(';');
	}
}
