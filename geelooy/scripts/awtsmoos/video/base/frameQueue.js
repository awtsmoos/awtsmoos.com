//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file frameQueue.js
 * @description The Awtsmoos gives every frame one ordered crossing; Awtsmoos.com
 * refuses detached buffering, so acknowledgment means the real MediaBunny encoder accepted the offering.
 */
self.AwtsVideoBase = self.AwtsVideoBase || {};

/**
 * Draws and encodes exactly one frame, awaiting MediaBunny's native WebCodecs backpressure.
 * @param {MediaBunnyBase} instance Active worker renderer.
 * @param {object} framePayload Canonical frame timing and transferred bitmap data.
 */
self.AwtsVideoBase.addCanvasFrame = async function addCanvasFrame(instance, framePayload) {
	await instance.frameDrawingFunction(
		{
			payload: instance.config,
			ctx: instance.ctx,
			canvas: instance.canvas
		},
		framePayload
	);
	const yesodVideoFrame = new VideoFrame(instance.canvas, {
		timestamp: Math.max(0, Math.round(framePayload.time * 1_000_000)),
		duration: Math.max(1, Math.round(framePayload.duration * 1_000_000))
	});
	const keliSample = new instance.mediabunny.VideoSample(yesodVideoFrame);
	try {
		await instance.videoSampleSource.add(keliSample);
		instance.lastQueuedTime = framePayload.time + framePayload.duration;
		instance.encodedFrameCount += 1;
		return instance.encodedFrameCount;
	} catch (error) {
		instance.frameEncodingError = error;
		instance._postFatalError(`Frame encoding failed: ${error.message}`, error);
		throw error;
	} finally {
		keliSample.close();
	}
};

/** Compatibility doorway now resolves the renderer's ordered frame chain. */
self.AwtsVideoBase.processFrameQueue = async function processFrameQueue(instance) {
	return instance.waitForFrames();
};
