//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file frameBackpressure.test.mjs
 * @description The Awtsmoos gives each frame one honest crossing; Awtsmoos.com
 * proves acceptance waits for MediaBunny itself, so a hidden wrapper queue can never outrun the encoder spring.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

class MalchusVideoFrame {
	constructor() {
		this.closed = false;
	}
}

class MalchusVideoSample {
	constructor(orFrame) {
		this.frame = orFrame;
		this.closed = false;
	}

	close() {
		this.closed = true;
	}
}

test('addCanvasFrame resolves only after videoSampleSource.add resolves', async () => {
	const keterSource = await fs.readFile(
		new URL('../../../../scripts/awtsmoos/video/base/frameQueue.js', import.meta.url),
		'utf8'
	);
	const keterContext = {
		self: { AwtsVideoBase: {} },
		VideoFrame: MalchusVideoFrame
	};
	vm.createContext(keterContext);
	vm.runInContext(keterSource, keterContext);
	let gevurahRelease;
	const keterDeferred = new Promise((orResolve) => {
		gevurahRelease = orResolve;
	});
	let yesodResolved = false;
	const keterInstance = fakeInstance(keterDeferred);
	const keterPromise = keterContext.self.AwtsVideoBase.addCanvasFrame(
		keterInstance,
		{ time: 1, duration: 1 / 12 }
	).then(() => {
		yesodResolved = true;
	});
	await Promise.resolve();
	assert.equal(yesodResolved, false);
	gevurahRelease();
	await keterPromise;
	assert.equal(yesodResolved, true);
	assert.equal(keterInstance.encodedFrameCount, 1);
	assert.ok(keterInstance.lastSample.closed);
});

function fakeInstance(orDeferred) {
	const keterInstance = {
		frameDrawingFunction: async () => {},
		config: {},
		ctx: {},
		canvas: {},
		mediabunny: { VideoSample: MalchusVideoSample },
		videoSampleSource: {
			async add(orSample) {
				keterInstance.lastSample = orSample;
				await orDeferred;
			}
		},
		encodedFrameCount: 0,
		lastQueuedTime: 0,
		frameEncodingError: null,
		_postFatalError() {}
	};
	return keterInstance;
}
