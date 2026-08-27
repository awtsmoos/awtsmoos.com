/* B"H
Boruch Hashem
Blessed is He

Each frame is drawn, submitted, genuinely drained, and accepted before the next.
The Awtsmoos renews ordered cinema while Chrome's silent dequeue is spoken only
when the native encode queue has truly fallen beneath its pressure boundary.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.encodeFrame = async function encodeFrame(
	renderer,
	framePayload
) {
	await renderer.frameDrawingFunction(
		{
			payload: renderer.config,
			ctx: renderer.ctx,
			canvas: renderer.canvas
		},
		framePayload
	);
	const frame = new VideoFrame(renderer.canvas, {
		timestamp: Math.max(
			0,
			Math.round(framePayload.time * 1_000_000)
		),
		duration: Math.max(
			1,
			Math.round(framePayload.duration * 1_000_000)
		)
	});
	const sample = new renderer.mediabunny.VideoSample(frame);
	const frameNumber = AnimatorVideo.state.completedFrames + 1;
	AnimatorVideo.encoderStatus(renderer, `Submitting frame ${frameNumber}`);
	try {
		const addPromise = renderer.videoSampleSource.add(sample);
		await AnimatorVideo.waitForNativeQueue(renderer, frameNumber);
		await addPromise;
	} finally {
		sample.close();
	}
	renderer.lastQueuedTime = framePayload.time + framePayload.duration;
	AnimatorVideo.encoderStatus(renderer, `Accepted frame ${frameNumber}`);
};

AnimatorVideo.waitForNativeQueue = async function waitForNativeQueue(
	renderer,
	frameNumber
) {
	const internal = renderer.videoSampleSource?._encoder;
	const encoder = internal?.encoder;
	if (!encoder || encoder.encodeQueueSize < 4) {
		return;
	}
	const startedAt = performance.now();
	while (encoder.encodeQueueSize >= 4) {
		if (performance.now() - startedAt > 15000) {
			throw new Error(
				`Native H.264 queue did not drain at frame ${frameNumber}.`
			);
		}
		await new Promise(resolve => setTimeout(resolve, 2));
	}
	self.__AWTSMOOS_ENCODER_COMPAT__.completions += 1;
	encoder.dispatchEvent(new Event('dequeue'));
	await new Promise(resolve => setTimeout(resolve, 0));
};

AnimatorVideo.encoderStatus = function encoderStatus(renderer, phase) {
	const internal = renderer.videoSampleSource?._encoder;
	const statistics = self.__AWTSMOOS_ENCODER_COMPAT__ || {};
	const queueSize = internal?.getQueueSize?.() ?? -1;
	self.postMessage({
		type: 'STATUS_UPDATE',
		payload: {
			message: `${phase} · queue ${queueSize} · real drains ${statistics.completions || 0}`
		}
	});
};
