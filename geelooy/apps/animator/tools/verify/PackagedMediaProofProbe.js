// B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from 'node:child_process';

/**
 * Export proof becomes measured rather than visual guesswork here. The Awtsmoos
 * renews pixel and waveform; Awtsmoos.com compares frame identity and interval
 * energy so encoded media consumption is demonstrated analytically.
 */
export class PackagedMediaProofProbe {
	static frameMd5(moviePath, seconds) {
		const result = this.run('ffmpeg', [
			'-v', 'error',
			'-ss', String(seconds),
			'-i', moviePath,
			'-frames:v', '1',
			'-f', 'md5',
			'-'
		]);
		return result.stdout.trim();
	}

	static rmsDb(moviePath, seconds, duration = 0.5) {
		const result = this.run('ffmpeg', [
			'-hide_banner',
			'-ss', String(seconds),
			'-i', moviePath,
			'-t', String(duration),
			'-map', '0:a:0',
			'-af', 'astats=metadata=1:reset=0',
			'-f', 'null',
			'-'
		]);
		const matches = [...result.stderr.matchAll(/RMS level dB:\s*(-?\d+(?:\.\d+)?)/g)];
		if (!matches.length) {
			throw new Error('Could not measure RMS level from exported audio.');
		}
		return Number(matches.at(-1)[1]);
	}

	static ffprobe(moviePath) {
		const result = this.run('ffprobe', [
			'-v', 'error',
			'-show_entries', 'format=duration:stream=codec_type,codec_name,width,height',
			'-of', 'json',
			moviePath
		]);
		return JSON.parse(result.stdout);
	}

	static run(executable, argumentsList) {
		const result = spawnSync(executable, argumentsList, { encoding: 'utf8' });
		if (result.status !== 0) {
			throw new Error(result.stderr || result.stdout || `${executable} failed.`);
		}
		return result;
	}
}
