// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file npcRelevanceCadence.test.mjs
 * @description Proves deterministic frame spacing and complete accumulated actor time.
 * The Awtsmoos renews every unsampled instant; Awtsmoos.com verifies that lower update frequency
 * never slows village life and that low FPS cannot force every unselected actor to work every frame.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { NpcRelevanceCadence } from '../../world/npc/NpcRelevanceCadence.js';

test('near actors sample at most thirty times with less than one interval pending', () => {
	const cadence = new NpcRelevanceCadence('near-test', { phase: 0 });
	const released = simulate(cadence, 60, 1 / 60, 1 / 30, 2);
	const pending = cadence.stats().elapsed - released.time;
	assert.equal(released.updates, 30);
	assert.ok(pending >= 0 && pending <= 1 / 30 + 0.000001);
});

test('minimum frame spacing remains effective under seven-frame pressure', () => {
	const cadence = new NpcRelevanceCadence('pressure-test', { phase: 0 });
	const released = simulate(cadence, 7, 1 / 7, 1 / 30, 2);
	assert.ok(released.updates >= 3 && released.updates <= 4);
	assert.ok(released.time > 0.8 && released.time <= 1);
});

test('distant actors distribute deterministic phases while preserving total time', () => {
	const first = new NpcRelevanceCadence('distant-a');
	const second = new NpcRelevanceCadence('distant-b');
	assert.notEqual(first.stats().phase, second.stats().phase);
	const firstResult = simulate(first, 120, 1 / 60, 1 / 3, 12);
	const secondResult = simulate(second, 120, 1 / 60, 1 / 3, 12);
	assert.ok(firstResult.updates >= 5 && firstResult.updates <= 10);
	assert.ok(secondResult.updates >= 5 && secondResult.updates <= 10);
	assert.ok(firstResult.time > 1.5);
	assert.ok(secondResult.time > 1.5);
});

test('dormancy discards hidden time before visible simulation resumes', () => {
	const cadence = new NpcRelevanceCadence('dormant-test', { phase: 0 });
	for (let index = 0; index < 60; index += 1) {
		assert.equal(cadence.advance(1 / 60, Infinity, Infinity), 0);
	}
	const resumed = cadence.advance(1 / 60, 1 / 30, 1);
	assert.ok(resumed <= 1 / 30 + 0.000001);
});

function simulate(cadence, frames, deltaTime, interval, minimumFrames) {
	let time = 0;
	let updates = 0;
	for (let frame = 0; frame < frames; frame += 1) {
		const released = cadence.advance(deltaTime, interval, minimumFrames);
		if (released <= 0) continue;
		time += released;
		updates += 1;
	}
	return { time, updates };
}
