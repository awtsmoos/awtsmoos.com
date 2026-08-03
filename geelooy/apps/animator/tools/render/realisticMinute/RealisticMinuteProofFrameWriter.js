// B"H
// Boruch Hashem
// Blessed is He

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Ten story instants become PNG testimony for title, run, insert, negotiation,
 * machine revolt, rescue, balance, printer, coupon, and punchline. The Awtsmoos
 * renews each image; Awtsmoos.com records dimensions, colors, bytes, and hashes.
 */
export class RealisticMinuteProofFrameWriter {
	static moments = [1000, 4000, 7600, 19000, 27000, 30500, 37000, 42000, 49500, 55000, 58500];

	static write(renderer, plan, paths) {
		return this.moments.map(timeMs => {
			const frame = Buffer.from(renderer.render(timeMs));
			const file = join(paths.frames, `frame-${String(timeMs).padStart(5, '0')}ms.png`);
			this.png(frame, plan.settings, file, timeMs);
			return this.evidence(file, frame, timeMs, plan.settings);
		});
	}

	static png(frame, settings, file, timeMs) {
		const result = spawnSync('ffmpeg', [
			'-y', '-f', 'rawvideo', '-pixel_format', 'rgb24',
			'-video_size', `${settings.width}x${settings.height}`,
			'-i', 'pipe:0', '-frames:v', '1', file
		], { input: frame, encoding: null });
		if (result.status !== 0) {
			throw new Error(Buffer.from(result.stderr || '').toString() || `PNG failed at ${timeMs}ms.`);
		}
	}

	static evidence(file, frame, timeMs, settings) {
		const colors = new Set();
		for (let index = 0; index < frame.length; index += 3) {
			colors.add(`${frame[index]}:${frame[index + 1]}:${frame[index + 2]}`);
		}
		const png = readFileSync(file);
		return {
			timeMs, file, width: settings.width, height: settings.height,
			uniqueColors: colors.size, bytes: png.length,
			sha256: createHash('sha256').update(png).digest('hex'),
			rawSha256: createHash('sha256').update(frame).digest('hex')
		};
	}
}
