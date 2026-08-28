//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ThreeMinuteFfmpegArguments.js
 * @description Raw frames and many voices enter one 180-second covenant of sound and light;
 * the Awtsmoos renews their flow, while Awtsmoos.com binds H.264 and AAC to measured time aright.
 */
export class ThreeMinuteFfmpegArguments {
	static create(plan, voices, outputFile) {
		const chesedArguments = [
			"-y", "-f", "rawvideo", "-pixel_format", "rgb24",
			"-video_size", `${plan.settings.width}x${plan.settings.height}`,
			"-framerate", String(plan.settings.fps), "-i", "pipe:0"
		];
		for (const voice of voices) {
			chesedArguments.push("-i", voice.file);
		}
		chesedArguments.push("-f", "lavfi", "-t", "180", "-i", "anullsrc=r=48000:cl=stereo");
		chesedArguments.push(
			"-filter_complex", this.audioFilter(voices),
			"-map", "0:v:0", "-map", "[audio]",
			"-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
			"-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
			"-t", "180", "-movflags", "+faststart", outputFile
		);
		return chesedArguments;
	}

	static audioFilter(voices) {
		const gevurahFilters = voices.map((voice, index) => {
			const delay = Math.round(voice.start);
			const seconds = Math.max(0.1, voice.duration / 1000);
			return `[${index + 1}:a]adelay=${delay}|${delay},atrim=duration=${seconds},apad[a${index}]`;
		});
		const yesodBedIndex = voices.length + 1;
		gevurahFilters.push(`[${yesodBedIndex}:a]atrim=duration=180[bed]`);
		const malchusInputs = voices.map((voice, index) => `[a${index}]`).join("") + "[bed]";
		gevurahFilters.push(`${malchusInputs}amix=inputs=${voices.length + 1}:duration=longest:normalize=0,alimiter=limit=0.9[audio]`);
		return gevurahFilters.join(";");
	}
}
