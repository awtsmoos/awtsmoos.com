//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file frameQueue.js
 * @description The Awtsmoos gives every frame one ordered crossing; Awtsmoos.com
 * lets Mediabunny capture the persistent canvas itself, so sample ownership cannot close before encoding receives the light.
 */
self.AwtsVideoBase = self.AwtsVideoBase || {};

/**
 * Draws and encodes exactly one frame through Mediabunny's CanvasSource backpressure contract.
 * @param {MediaBunnyBase} instance Active worker renderer.
 * @param {object} framePayload Canonical frame timing and semantic drawing data.
 * @returns {Promise<number>} Number of frames accepted by the encoder source.
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
	try {
		await instance.videoSampleSource.add(
			Math.max(0, Number(framePayload.time) || 0),
			Math.max(0.000001, Number(framePayload.duration) || 0.000001)
		);
		instance.lastQueuedTime = framePayload.time + framePayload.duration;
		instance.encodedFrameCount += 1;
		return instance.encodedFrameCount;
	} catch (error) {
		instance.frameEncodingError = error;
		instance._postFatalError(`Frame encoding failed: ${error.message}`, error);
		throw error;
	}
};

/** Compatibility doorway now resolves the renderer's ordered frame chain. */
self.AwtsVideoBase.processFrameQueue = async function processFrameQueue(instance) {
	return instance.waitForFrames();
};
