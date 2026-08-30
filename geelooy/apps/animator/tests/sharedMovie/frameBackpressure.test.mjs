//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file frameBackpressure.test.mjs
 * @description The Awtsmoos gives each canvas frame one honest crossing; Awtsmoos.com
 * proves acknowledgement waits for MediaBunny CanvasSource itself, so no hidden wrapper queue outruns the encoder spring.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('addCanvasFrame waits for CanvasSource.add and preserves exact seconds', async () => {
	const keterSource = await fs.readFile(
		new URL('../../../../scripts/awtsmoos/video/base/frameQueue.js', import.meta.url),
		'utf8'
	);
	const keterContext = {
		self: {
			AwtsVideoBase: {}
		}
	};
	vm.createContext(keterContext);
	vm.runInContext(keterSource, keterContext);
	let gevurahRelease;
	let binahMarkStarted;
	const keterDeferred = new Promise((orResolve) => {
		gevurahRelease = orResolve;
	});
	const binahStarted = new Promise((orResolve) => {
		binahMarkStarted = orResolve;
	});
	let yesodResolved = false;
	const keterInstance = fakeInstance(keterDeferred, binahMarkStarted);
	const keterPromise = keterContext.self.AwtsVideoBase.addCanvasFrame(
		keterInstance,
		{
			time: 1,
			duration: 1 / 12
		}
	).then(() => {
		yesodResolved = true;
	});
	await binahStarted;
	assert.equal(yesodResolved, false);
	assert.deepEqual(keterInstance.lastAdd, {
		time: 1,
		duration: 1 / 12
	});
	gevurahRelease();
	await keterPromise;
	assert.equal(yesodResolved, true);
	assert.equal(keterInstance.encodedFrameCount, 1);
	assert.equal(keterInstance.lastQueuedTime, 1 + 1 / 12);
});

/** Creates one deferred CanvasSource-like encoder fixture and exposes the moment source ingestion begins. */
function fakeInstance(orDeferred, orMarkStarted) {
	const keterInstance = {
		frameDrawingFunction: async () => {},
		config: {},
		ctx: {},
		canvas: {},
		videoSampleSource: {
			async add(orTime, orDuration) {
				keterInstance.lastAdd = {
					time: orTime,
					duration: orDuration
				};
				orMarkStarted();
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
