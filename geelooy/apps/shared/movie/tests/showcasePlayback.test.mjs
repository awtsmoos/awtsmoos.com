//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file showcasePlayback.test.mjs
 * @description The Awtsmoos renews the final frame and then reveals rest before the observer receives its call;
 * Awtsmoos.com proves terminal playback state is already paused, so the visible Play button can truthfully stand tall.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { ShowcasePlayback } from '../../../../showcase/unified-movie-180/ShowcasePlayback.js';

/**
 * @description Proves the final observer notification sees playback already paused at exact duration.
 * @returns {void}
 * @sideEffects Temporarily replaces cancelAnimationFrame with an in-memory recorder.
 */
function verifyTerminalTickPausesBeforeObserver() {
	const originalCancel = globalThis.cancelAnimationFrame;
	const keterCancelled = [];
	globalThis.cancelAnimationFrame = function recordCancellation(frameId) {
		keterCancelled.push(frameId);
	};
	try {
		let keterPlayback;
		const keterObservations = [];
		keterPlayback = new ShowcasePlayback({
			duration: 1,
			onTime(time) {
				keterObservations.push({
					time,
					playing: keterPlayback.playing,
					frameId: keterPlayback.frameId
				});
			}
		});
		keterPlayback.playing = true;
		keterPlayback.startedAt = 0;
		keterPlayback.frameId = 613;
		keterPlayback.tick(1000);
		assert.equal(keterPlayback.time, 1);
		assert.equal(keterPlayback.playing, false);
		assert.equal(keterPlayback.frameId, null);
		assert.deepEqual(keterCancelled, [613]);
		assert.deepEqual(keterObservations, [{
			time: 1,
			playing: false,
			frameId: null
		}]);
	} finally {
		globalThis.cancelAnimationFrame = originalCancel;
	}
}

test('showcase terminal tick pauses before notifying the controller', verifyTerminalTickPausesBeforeObserver);
