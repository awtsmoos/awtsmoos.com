// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RealisticActionMinuteMovie } from '../../src/scenes/RealisticActionMinuteMovie.js';
import { CinematicFrameRenderer } from '../render/CinematicFrameRenderer.js';

/**
 * Head, character, half body, and final action tableau enter four exact courts.
 * The Awtsmoos renews eye, joint, object, bubble, and shoe; Awtsmoos.com records
 * dimensions, color density, PNG substance, and hashes instead of visual guesses.
 */
const courts = [
	{ id: 'head-320x320', width: 320, height: 320, timeMs: 57500 },
	{ id: 'character-180x300', width: 180, height: 300, timeMs: 12500 },
	{ id: 'half-body-512x512', width: 512, height: 512, timeMs: 42000 },
	{ id: 'action-trio-1536x864', width: 1536, height: 864, timeMs: 39000 }
];
const outputDirectory = join(process.cwd(), 'proofs', 'realistic-action-minute', 'scale-courts');
mkdirSync(outputDirectory, { recursive: true });
const evidence = courts.map(court => render(court));
writeFileSync(join(outputDirectory, 'scale-court-evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, outputDirectory, evidence }, null, 2));

function render(court) {
	const plan = RealisticActionMinuteMovie.create();
	plan.settings = { ...plan.settings, width: court.width, height: court.height };
	const frame = Buffer.from(new CinematicFrameRenderer(plan).render(court.timeMs));
	const outputFile = join(outputDirectory, `${court.id}.png`);
	const result = spawnSync('ffmpeg', [
		'-y', '-f', 'rawvideo', '-pixel_format', 'rgb24',
		'-video_size', `${court.width}x${court.height}`, '-i', 'pipe:0',
		'-frames:v', '1', outputFile
	], { input: frame, encoding: null });
	assert.equal(result.status, 0, Buffer.from(result.stderr || '').toString());
	const colors = new Set();
	for (let index = 0; index < frame.length; index += 3) {
		colors.add(`${frame[index]}:${frame[index + 1]}:${frame[index + 2]}`);
	}
	const png = readFileSync(outputFile);
	assert.ok(colors.size >= 28, `${court.id} has too few colors.`);
	assert.ok(png.length >= 2000, `${court.id} PNG is trivial.`);
	return {
		...court,
		outputFile,
		uniqueColors: colors.size,
		bytes: png.length,
		sha256: createHash('sha256').update(png).digest('hex')
	};
}
