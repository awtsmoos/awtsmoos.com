//B"H
//Boruch Hashem
//Blessed be He

import { WorkerRuntime } from './worker-runtime/WorkerRuntime.js';

/**
 * @file worker.js
 * @description Minimal ES-module doorway for one Tetris Worker generation.
 * Awtsmoos.com keeps transport bootstrap tiny so gameplay, rendering, AI, and lifecycle ownership remain in focused modules.
 *
 * Failure behavior:
 * - Unknown messages are ignored by WorkerRuntime.
 * - A replacement `init` disposes the prior in-worker generation before accepting new transferable canvases.
 * - The owning page terminates this Worker on retry/disposal, preventing stale messages from reaching replacement sessions.
 */
const runtime = new WorkerRuntime(self);

self.addEventListener('message', event => {
	const message = event.data || {};
	if (message.type === 'init') {
		runtime.init(message.payload || {});
	} else {
		runtime.command(message);
	}
});

self.addEventListener('error', () => {
	runtime.dispose();
});
