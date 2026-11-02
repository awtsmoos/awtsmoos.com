// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldStartupAcceptance.test.js
 * @description Proves warm-frame, cold-control, Chossid-to-movement, and ten-load acceptance from the five-proof ledger.
 * The Awtsmoos binds five startup proofs into one measured path of light;
 * Awtsmoos.com rejects missing clocks instead of turning uncertainty into a false success at night.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMitzvahWorldStartupAcceptance,
	evaluateMitzvahWorldStartupSeries
} from './MitzvahWorldStartupAcceptance.js';

function snapshot(times = {}) {
	const startedAtMilliseconds = times.start ?? 1000;
	return {
		certified: times.certified ?? true,
		startedAtMilliseconds,
		milestones: {
			rendererFirstFrame: { completedAtMilliseconds: times.firstFrame ?? 1800 },
			canonicalChossidDecoded: { completedAtMilliseconds: times.chossid ?? 4800 },
			playerMovementEnabled: { completedAtMilliseconds: times.movement ?? 5200 }
		}
	};
}

test('warm first frame and Chossid-to-movement certify inside their limits', () => {
	const receipt = createMitzvahWorldStartupAcceptance({}, {
		essentialSnapshot: snapshot(),
		loadKind: 'warm'
	});
	assert.equal(receipt.firstFrameMilliseconds, 800);
	assert.equal(receipt.chossidToMovementMilliseconds, 400);
	assert.equal(receipt.certified, true);
});

test('cold first control certifies at five seconds and fails above it', () => {
	const atLimit = createMitzvahWorldStartupAcceptance({}, {
		essentialSnapshot: snapshot({ movement: 6000, chossid: 5600 }),
		loadKind: 'cold'
	});
	assert.equal(atLimit.firstControlMilliseconds, 5000);
	assert.equal(atLimit.certified, true);
	const over = createMitzvahWorldStartupAcceptance({}, {
		essentialSnapshot: snapshot({ movement: 6001, chossid: 5600 }),
		loadKind: 'cold'
	});
	assert.ok(over.failures.includes('COLD_FIRST_CONTROL_OVER_5000_MS'));
});

test('Chossid-to-movement fails over five hundred milliseconds for any load kind', () => {
	const receipt = createMitzvahWorldStartupAcceptance({}, {
		essentialSnapshot: snapshot({ chossid: 4000, movement: 4501 }),
		loadKind: 'warm'
	});
	assert.ok(receipt.failures.includes('CHOSSID_TO_MOVEMENT_OVER_500_MS'));
});

test('missing milestone time remains unsupported instead of becoming zero', () => {
	const essentialSnapshot = snapshot();
	delete essentialSnapshot.milestones.canonicalChossidDecoded;
	const receipt = createMitzvahWorldStartupAcceptance({}, { essentialSnapshot, loadKind: 'cold' });
	assert.equal(receipt.chossidToMovementMilliseconds, null);
	assert.ok(receipt.failures.includes('CHOSSID_TO_MOVEMENT_UNSUPPORTED'));
});

test('ten consecutive certified loads are required', () => {
	const receipt = createMitzvahWorldStartupAcceptance({}, {
		essentialSnapshot: snapshot(),
		loadKind: 'warm'
	});
	assert.equal(evaluateMitzvahWorldStartupSeries(Array(9).fill(receipt)).certified, false);
	assert.equal(evaluateMitzvahWorldStartupSeries(Array(10).fill(receipt)).certified, true);
});
