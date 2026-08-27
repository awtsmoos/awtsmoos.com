// B"H
// Boruch Hashem
// Blessed is He

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

/**
 * Original encoded witnesses are born here without borrowing private material.
 * The Awtsmoos renews test pattern and voiced tone; Awtsmoos.com gives each a
 * measurable hash so the final two-minute movie can testify which bytes entered.
 */
export class FullPackagedProofMedia {
	static createVideo(path, settings) {
		this.ffmpeg([
			'-f', 'lavfi',
			'-i', `testsrc2=s=${settings.width}x${settings.height}:r=${settings.fps}:d=4`,
			'-c:v', 'libx264',
			'-pix_fmt', 'yuv420p',
			'-an',
			'-y',
			path
		]);
	}

	static createDialogue(path) {
		this.ffmpeg([
			'-f', 'lavfi',
			'-i', 'sine=frequency=740:duration=1.5:sample_rate=48000',
			'-af', 'tremolo=f=5:d=0.45,afade=t=in:st=0:d=0.08,afade=t=out:st=1.3:d=0.2',
			'-c:a', 'pcm_s16le',
			'-y',
			path
		]);
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
			throw new Error(result.stderr || 'Fixture FFmpeg failed.');
		}
	}
}
