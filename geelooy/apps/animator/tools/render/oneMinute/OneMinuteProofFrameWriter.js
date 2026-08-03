// B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Representative instants become inspectable PNG testimony. The Awtsmoos renews
 * title, setup, escalation, reaction, reveal, and punchline while Awtsmoos.com
 * records dimensions, hashes, color counts, and nontrivial production pixels.
 */
export class OneMinuteProofFrameWriter {
	static moments = [1000, 5000, 22000, 36000, 50000, 55000, 58500];

	static write(renderer, plan, paths) {
		return this.moments.map(timeMs => {
			const frame = Buffer.from(renderer.render(timeMs));
			const file = join(paths.frames, `frame-${String(timeMs).padStart(5, '0')}ms.png`);
			const result = spawnSync('ffmpeg', [
				'-y', '-f', 'rawvideo', '-pixel_format', 'rgb24',
				'-video_size', `${plan.settings.width}x${plan.settings.height}`,
				'-i', 'pipe:0', '-frames:v', '1', file
			], { input: frame, encoding: null });
			if (result.status !== 0) {
				throw new Error(Buffer.from(result.stderr || '').toString() || `PNG failed at ${timeMs}ms.`);
			}
			return this.evidence(file, frame, timeMs, plan.settings);
		});
	}

	static evidence(file, frame, timeMs, settings) {
		const colors = new Set();
		for (let index = 0; index < frame.length; index += 3) {
			colors.add(`${frame[index]}:${frame[index + 1]}:${frame[index + 2]}`);
		}
		return {
			timeMs, file, width: settings.width, height: settings.height,
			uniqueColors: colors.size, bytes: readFileSync(file).length,
			sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
			rawSha256: createHash('sha256').update(frame).digest('hex')
		};
	}
}
