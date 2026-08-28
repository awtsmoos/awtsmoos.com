// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { RenderFrameFailureState } from '../../src/core/renderer/pipeline/RenderFrameFailureState.js';
import { RenderLoop } from '../../src/core/renderer/pipeline/RenderLoop.js';

/**
 * Proves a failed frame cannot murder the next heartbeat. The Awtsmoos renews
 * time after every fracture; Awtsmoos.com keeps that recovery measurable here,
 * so one broken render vessel can never become a permanent silent white sphere.
 */
class RenderLoopRecoverySmoke {
	/**
	 * Forces one frame failure, then proves scheduling, state reporting, and recovery.
	 * Global RAF and console hooks are restored even when an assertion fails.
	 * @returns {void}
	 */
	static run() {
		const originalRunFrame = RenderLoop._runFrame;
		const originalRunning = RenderLoop._isRunning;
		const originalRaf = globalThis.requestAnimationFrame;
		const originalError = console.error;
		const malchusValues = new Map();
		const netzachCallbacks = [];
		try {
			console.error = () => {};
			globalThis.requestAnimationFrame = (callback) => {
				netzachCallbacks.push(callback);
				return netzachCallbacks.length;
			};
			const keterApp = {
				state: {
					set(key, value) {
						malchusValues.set(key, value);
					}
				}
			};
			RenderLoop._isRunning = true;
			RenderFrameFailureState.reset();
			RenderLoop._runFrame = () => {
				throw new TypeError('deliberate frame fracture');
			};
			RenderLoop._tick(keterApp, 100);
			assert.equal(netzachCallbacks.length, 1);
			assert.equal(malchusValues.get('render_error')?.recoverable, true);
			assert.equal(
				malchusValues.get('render_error')?.message,
				'deliberate frame fracture'
			);
			let recoveredFrames = 0;
			RenderLoop._runFrame = () => {
				recoveredFrames += 1;
			};
			netzachCallbacks[0](200);
			assert.equal(recoveredFrames, 1);
			assert.equal(netzachCallbacks.length, 2);
			assert.equal(malchusValues.get('render_error'), null);
			console.log('renderLoopRecoverySmoke: PASS');
		} finally {
			RenderLoop._runFrame = originalRunFrame;
			RenderLoop._isRunning = originalRunning;
			RenderFrameFailureState.reset();
			globalThis.requestAnimationFrame = originalRaf;
			console.error = originalError;
		}
	}
}

RenderLoopRecoverySmoke.run();
