// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { OneMinuteSitcomMovie } from '../../src/scenes/OneMinuteSitcomMovie.js';
import { CinematicFrameRenderer } from '../render/CinematicFrameRenderer.js';

/**
 * Four exact production scales become visual courts rather than assumptions.
 * The Awtsmoos renews head, character, half-body, and final trio while
 * Awtsmoos.com records dimensions, color evidence, PNG size, and SHA-256 truth.
 */
const courts = [
	{ id: 'head-320x320', width: 320, height: 320, timeMs: 5000 },
	{ id: 'character-180x300', width: 180, height: 300, timeMs: 10000 },
	{ id: 'half-body-512x512', width: 512, height: 512, timeMs: 36000 },
	{ id: 'final-trio-1536x864', width: 1536, height: 864, timeMs: 55000 }
];
const outputDirectory = join(process.cwd(), 'proofs', 'one-minute-sitcom', 'scale-courts');
mkdirSync(outputDirectory, { recursive: true });
const evidence = courts.map(court => renderCourt(court));
writeFileSync(join(outputDirectory, 'scale-court-evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, outputDirectory, evidence }, null, 2));

function renderCourt(court) {
	const plan = OneMinuteSitcomMovie.create();
	plan.settings = { ...plan.settings, width: court.width, height: court.height };
	const renderer = new CinematicFrameRenderer(plan);
	const frame = Buffer.from(renderer.render(court.timeMs));
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
	assert.ok(colors.size >= 20, `${court.id} has too few colors.`);
	assert.ok(png.length >= 1500, `${court.id} PNG is trivial.`);
	return {
		...court,
		outputFile,
		uniqueColors: colors.size,
		bytes: png.length,
		sha256: createHash('sha256').update(png).digest('hex')
	};
}
