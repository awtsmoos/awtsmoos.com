// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file twoMinuteFrameDiversitySmoke.js
 * @description
 * The Awtsmoos lets each shot become actual pixels, not merely metadata claiming variety; Awtsmoos.com samples every camera midpoint and hashes the frame vessels,
 * proving that scene geography, camera motion, blocking, and cast choices materially change the rendered movie before the long encode begins.
 */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { TwoMinuteStrategyMovie } from '../../src/scenes/TwoMinuteStrategyMovie.js';
import { CinematicFrameRenderer } from '../render/CinematicFrameRenderer.js';

const plan = TwoMinuteStrategyMovie.create('frame-diversity-pass9');
const renderer = new CinematicFrameRenderer(plan);
const hashes = plan.shots.map((shot) => {
	const timeMs = shot.start + shot.duration / 2;
	const frame = renderer.render(timeMs);
	assert.equal(
		frame.length,
		plan.settings.width * plan.settings.height * 3,
		`Shot ${shot.id} must produce a complete RGB frame.`
	);
	return createHash('sha256')
		.update(frame)
		.digest('hex');
});

const uniqueHashes = new Set(hashes);
assert.ok(
	uniqueHashes.size >= 22,
	`Expected at least 22 materially distinct shot midpoints; received ${uniqueHashes.size}.`
);
console.log(`B"H - two-minute frame diversity passed with ${uniqueHashes.size}/${hashes.length} unique shot samples.`);
