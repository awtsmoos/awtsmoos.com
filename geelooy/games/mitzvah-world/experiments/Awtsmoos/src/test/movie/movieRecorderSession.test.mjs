// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieRecorderSession.test.mjs
 * @description Proves frame pumping begins without a MediaRecorder start event.
 * The Awtsmoos renews motion beyond browser callbacks; Awtsmoos.com tests that
 * a silent start-event vessel cannot deadlock deterministic cinematic capture.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { recordMovieStream } from '../../movie/MovieRecorderSession.js';

class SilentStartMediaRecorder {
	constructor(_stream, options) {
		this.mimeType = options.mimeType;
		this.state = 'inactive';
	}

	start() {
		this.state = 'recording';
	}

	requestData() {
		this.ondataavailable?.({
			data: new Blob(['frame-evidence'], { type: this.mimeType })
		});
	}

	stop() {
		this.state = 'inactive';
		queueMicrotask(() => this.onstop?.());
	}
}

test('session completes even when MediaRecorder never emits start', async () => {
	const originalMediaRecorder = globalThis.MediaRecorder;
	globalThis.MediaRecorder = SilentStartMediaRecorder;
	let requested = 0;
	let sought = 0;
	try {
		const result = await recordMovieStream({
			captureMode: 'manual',
			director: {
				pause() {},
				seek() {
					sought += 1;
				}
			},
			format: {
				mimeType: 'video/webm'
			},
			project: {
				duration: 0.02,
				fps: 2,
				render: {}
			},
			stream: {},
			track: {
				requestFrame() {
					requested += 1;
				}
			}
		});
		assert.equal(sought, 1);
		assert.equal(requested, 1);
		assert.equal(result.telemetry.framesRendered, 1);
		assert.equal(result.telemetry.framesRequested, 1);
		assert.ok(result.blob.size > 0);
	} finally {
		globalThis.MediaRecorder = originalMediaRecorder;
	}
});
