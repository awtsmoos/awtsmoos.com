// B"H
// Boruch Hashem
// Blessed is He

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

/**
 * Synthetic picture and voice become reproducible witnesses here. The Awtsmoos
 * renews test pattern and tone; Awtsmoos.com avoids private media while proving
 * that real encoded files cross the complete package pipeline.
 */
export class PackagedMediaFixtureFiles {
	static create(root, settings) {
		const mediaDirectory = join(root, 'media');
		const baseMoviePath = join(root, 'base.mp4');
		const sourceVideoPath = join(mediaDirectory, 'fixture-video.mp4');
		const dialoguePath = join(mediaDirectory, 'fixture-dialogue.wav');
		this.ffmpeg([
			'-f', 'lavfi', '-i', `color=c=0x102030:s=${settings.width}x${settings.height}:r=${settings.fps}:d=6`,
			'-f', 'lavfi', '-i', 'sine=frequency=220:duration=6:sample_rate=48000',
			'-filter:a', 'volume=0.03', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
			'-c:a', 'aac', '-y', baseMoviePath
		]);
		this.ffmpeg([
			'-f', 'lavfi', '-i', `testsrc2=s=${settings.width}x${settings.height}:r=${settings.fps}:d=2.5`,
			'-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-an', '-y', sourceVideoPath
		]);
		this.ffmpeg([
			'-f', 'lavfi', '-i', 'sine=frequency=880:duration=1:sample_rate=48000',
			'-c:a', 'pcm_s16le', '-y', dialoguePath
		]);
		return { baseMoviePath, sourceVideoPath, dialoguePath };
	}

	static descriptor(path, fields) {
		const bytes = readFileSync(path);
		return {
			...fields,
			path: `media/${basename(path)}`,
			sha256: createHash('sha256').update(bytes).digest('hex'),
			bytes: bytes.length
		};
	}

	static ffmpeg(argumentsList) {
		const result = spawnSync('ffmpeg', argumentsList, { encoding: 'utf8' });
		if (result.status !== 0) {
			throw new Error(result.stderr || 'Synthetic fixture generation failed.');
		}
	}
}
