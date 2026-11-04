// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

import { NetzachAnimatorBrowserFramePump } from '../../src/studio/export/browser/AnimatorBrowserFramePump.js';
import { AnimatorBrowserWorkerSession } from '../../src/studio/export/browser/AnimatorBrowserWorkerSession.js';
import { AnimatorWorkerTransport } from '../../src/studio/export/browser/AnimatorWorkerTransport.js';

const BASE = new URL('../../../../scripts/awtsmoos/video/base/', import.meta.url);

/** Loads one classic worker-base script into a vm context with stubbed AwtsVideoBase seams. */
async function loadBaseScript(fileName) {
	const context = {
		self: null,
		console,
		OffscreenCanvas: class {
			constructor(width, height) { this.width = width; this.height = height; }
			getContext() { return {}; }
		},
		AudioBuffer: class { constructor(shim) { this.shim = shim; } },
		Blob
	};
	context.self = context;
	vm.createContext(context);
	vm.runInContext(await readFile(new URL(fileName, BASE), 'utf8'), context);
	return context;
}

test('worker INIT config carries includeAudio so the worker can skip the audio track', () => {
	const base = { width: 640, height: 360, fps: 12, quality: 0.7 };
	assert.equal(AnimatorWorkerTransport.config(base).includeAudio, true, 'default keeps audio');
	assert.equal(AnimatorWorkerTransport.config({ ...base, includeAudio: true }).includeAudio, true);
	assert.equal(AnimatorWorkerTransport.config({ ...base, includeAudio: false }).includeAudio, false);
});

test('MediaBunnyBase creates no audio track when the config carries includeAudio false', async () => {
	const context = await loadBaseScript('MediaBunnyBase.js');
	const calls = { audioTracks: 0, videoTracks: 0 };
	context.AwtsVideoBase = {
		loadMediabunny: () => ({}),
		createOutput: () => ({
			addVideoTrack: () => { calls.videoTracks += 1; },
			addAudioTrack: () => { calls.audioTracks += 1; },
			start: async () => {}
		}),
		pickVideoCodec: async () => 'avc1.42001f',
		createVideoSource: () => ({}),
		createAudioSource: () => ({}),
		postStatus: () => {}
	};
	const Renderer = context.MediaBunnyBase;
	const format = { resolution: { width: 64, height: 64 }, outputFormat: { fps: 12 } };

	const silent = new Renderer({ ...format, includeAudio: false }, () => {});
	await silent.start();
	assert.equal(calls.videoTracks, 1);
	assert.equal(calls.audioTracks, 0, 'a silent session must not create an AAC track');
	assert.equal(silent.audioBufferSource, undefined);

	const withAudio = new Renderer({ ...format }, () => {});
	await withAudio.start();
	assert.equal(calls.audioTracks, 1, 'the default session keeps its audio track');
	assert.ok(withAudio.audioBufferSource);
});

test('worker finalize muxes a playable MP4 with a null audio shim', async () => {
	const context = await loadBaseScript('finalize.js');
	let audioAdds = 0;
	const instance = {
		lastQueuedTime: 1.5,
		addedTail: null,
		async waitForFrames() {},
		async addFrame(frame) { this.addedTail = frame; },
		videoSampleSource: { close() {} },
		audioBufferSource: undefined,
		_postStatus() {},
		output: {
			format: { mimeType: 'video/mp4' },
			target: { buffer: new ArrayBuffer(8) },
			async finalize() {}
		}
	};
	const blob = await context.AwtsVideoBase.finalizeOutput(instance, null, { durationSeconds: 2 });
	assert.ok(blob instanceof Blob, 'a silent finalize still produces the MP4 blob');
	assert.equal(audioAdds, 0);
	// Field-wise compare: the frame object is created inside the vm realm.
	assert.equal(instance.addedTail?.time, 1.5);
	assert.equal(instance.addedTail?.duration, 0.5,
		'the tail-frame fill takes its duration from durationSeconds when no shim exists');
});

test('worker finalize still encodes audio when a shim and an audio source exist', async () => {
	const context = await loadBaseScript('finalize.js');
	let addedBuffer = null;
	const instance = {
		lastQueuedTime: 2,
		async waitForFrames() {},
		async addFrame() { throw new Error('no tail fill expected at full duration'); },
		videoSampleSource: { close() {} },
		audioBufferSource: {
			async add(buffer) { addedBuffer = buffer; },
			close() {}
		},
		_postStatus() {},
		output: {
			format: { mimeType: 'video/mp4' },
			target: { buffer: new ArrayBuffer(8) },
			async finalize() {}
		}
	};
	const shim = { duration: 2, sampleRate: 48000, numberOfChannels: 2, length: 96000, channels: [] };
	const blob = await context.AwtsVideoBase.finalizeOutput(instance, shim, {});
	assert.ok(blob instanceof Blob);
	assert.ok(addedBuffer instanceof context.AudioBuffer, 'the soundtrack is encoded exactly as before');
	assert.equal(addedBuffer.shim, shim);
});

test('session finalize sends a null shim and no transfers for a silent plan', async () => {
	const session = new AnimatorBrowserWorkerSession({}, {}, 1000);
	const seen = [];
	session.broker = { request: async (...args) => { seen.push(args); return {}; } };

	await session.finalize({ includeAudio: false, audioBufferShim: null, fileName: 'a.mp4', durationSeconds: 3 }, 36);
	assert.equal(seen[0][0], 'FINALIZE');
	assert.equal(seen[0][1].audioBufferShim, null);
	assert.deepEqual(seen[0][3], [], 'no channel buffers are transferred for a silent render');

	const buffer = new ArrayBuffer(4);
	const shim = { channels: [{ buffer }] };
	await session.finalize({ includeAudio: true, audioBufferShim: shim, fileName: 'b.mp4', durationSeconds: 3 }, 36);
	assert.equal(seen[1][1].audioBufferShim, shim);
	assert.deepEqual(seen[1][3], [buffer], 'an audio render still transfers its channel buffers');
});

test('frame pump publishes measured ETA evidence on progress', async () => {
	const events = [];
	const pump = new NetzachAnimatorBrowserFramePump(
		{ request: async () => ({}) },
		{ onProgress: event => events.push(event) }
	);
	const payload = {
		durationSeconds: 1,
		fps: 4,
		width: 64,
		height: 64,
		frameSource: {
			prepare: async () => {},
			capture: async () => ({ close() {} })
		}
	};
	assert.equal(await pump.pump(payload), 4);
	assert.equal(events.length, 4);
	for (const event of events) {
		assert.equal(typeof event.elapsedMs, 'number');
		assert.equal(typeof event.estimatedRemainingMs, 'number');
	}
	assert.equal(events.at(-1).estimatedRemainingMs, 0);
});

test('frame pump stops at the next frame boundary when the render is cancelled', async () => {
	const controller = new AbortController();
	let captured = 0;
	const pump = new NetzachAnimatorBrowserFramePump(
		{ request: async () => ({}) },
		{ signal: controller.signal }
	);
	const payload = {
		durationSeconds: 10,
		fps: 10,
		width: 64,
		height: 64,
		frameSource: {
			prepare: async () => {},
			capture: async () => {
				captured += 1;
				if (captured === 3) controller.abort();
				return { close() {} };
			}
		}
	};
	await assert.rejects(pump.pump(payload), error => error?.name === 'AbortError');
	assert.equal(captured, 3, 'no further frames are captured after the abort lands');
});
