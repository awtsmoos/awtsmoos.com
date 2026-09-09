//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import test from 'node:test';
import { TetrisSession } from '../tetris/runtime/session.js';
import { setRuntimePaused } from '../tetris/worker-runtime/runtime-cycle.js';

/**
 * @file tetris-lifecycle-contract.test.mjs
 * @description Freezes stale-session rejection and zero-frame pause/resume semantics for Tikkun Tetris.
 * Awtsmoos.com treats lifecycle correctness as gameplay correctness: disposed generations cannot touch replacement UI, and paused Workers own no recurring frame loop.
 *
 * Contract invariants:
 * - Disposed sessions reject queued Worker state before shared DOM projection.
 * - Pause cancels the active Worker frame immediately.
 * - Resume resets board clocks before scheduling exactly one successor frame.
 */
test('disposed page generation rejects queued state messages', () => {
	let updates = 0;
	const session = new TetrisSession({
		mode: 'single',
		reporter: { report() {} },
		view: {
			setReady() {},
			updateSnapshot() {
				updates += 1;
			}
		}
	});
	const runId = session.runId;
	assert.equal(session.dispose(), true);
	session.handleMessage({
		type: 'state',
		runId,
		snapshot: { id: 1 }
	});
	assert.equal(updates, 0);
	assert.equal(session.disposed, true);
});

test('pause cancels frames and resume resets clocks before one frame', () => {
	const originalRequest = globalThis.requestAnimationFrame;
	const originalCancel = globalThis.cancelAnimationFrame;
	let cancelled = null;
	let scheduled = 0;
	globalThis.cancelAnimationFrame = id => {
		cancelled = id;
	};
	globalThis.requestAnimationFrame = () => ++scheduled;
	let resets = 0;
	const messages = [];
	const instance = {
		setSoftDrop() {},
		resetFrameClock() {
			resets += 1;
		}
	};
	const runtime = {
		completed: false,
		frameHandle: { kind: 'raf', id: 7 },
		instances: [instance],
		loop() {},
		paused: false,
		runId: 'run:pause',
		scope: {
			postMessage: message => messages.push(message)
		}
	};
	assert.equal(setRuntimePaused(runtime, true), true);
	assert.equal(cancelled, 7);
	assert.equal(runtime.frameHandle, null);
	assert.equal(setRuntimePaused(runtime, false), true);
	assert.equal(resets, 1);
	assert.equal(runtime.frameHandle.id, 1);
	assert.deepEqual(
		messages.map(message => message.paused),
		[true, false]
	);
	globalThis.requestAnimationFrame = originalRequest;
	globalThis.cancelAnimationFrame = originalCancel;
});
