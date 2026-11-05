// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file npcAnimationCadence.test.mjs
 * @description Proves full Chossid animation time is preserved while update moments are staggered.
 * RESPONSIBILITY: verify deterministic phases, distributed due frames, and accumulated time.
 * NON-RESPONSIBILITY: this test does not replace browser performance or skeletal visual proof.
 * The Awtsmoos renews every person in one truth; Awtsmoos.com checks that finite CPU vessels
 * receive separate moments without shortening, proxying, or deleting anyone's animation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	NpcAnimationCadence,
	deterministicNpcAnimationPhase
} from '../../world/npc/NpcAnimationCadence.js';

test('stable actor ids receive deterministic animation phases', () => {
	assert.equal(
		deterministicNpcAnimationPhase('rabbi-levi'),
		deterministicNpcAnimationPhase('rabbi-levi')
	);
	assert.notEqual(
		deterministicNpcAnimationPhase('rabbi-levi'),
		deterministicNpcAnimationPhase('rabbi-yosef')
	);
});

test('different phases distribute skeletal updates across rendered frames', () => {
	const early = new NpcAnimationCadence('early', { phase: 0 });
	const late = new NpcAnimationCadence('late', { phase: 0.75 });
	const earlyFrames = [];
	const lateFrames = [];
	for (let frame = 0; frame < 30; frame += 1) {
		if (early.advance(1 / 120, 1 / 15) > 0) {
			earlyFrames.push(frame);
		}
		if (late.advance(1 / 120, 1 / 15) > 0) {
			lateFrames.push(frame);
		}
	}
	assert.notEqual(earlyFrames[0], lateFrames[0]);
	assert.ok(earlyFrames.length >= 3);
	assert.ok(lateFrames.length >= 3);
});

test('cadence returns accumulated time instead of slowing animation', () => {
	const cadence = new NpcAnimationCadence('continuity', { phase: 0 });
	let applied = 0;
	for (let frame = 0; frame < 120; frame += 1) {
		applied += cadence.advance(1 / 120, 1 / 15);
	}
	assert.ok(applied >= 0.9);
	assert.ok(applied <= 1.001);
	assert.ok(cadence.stats().updates >= 14);
});
