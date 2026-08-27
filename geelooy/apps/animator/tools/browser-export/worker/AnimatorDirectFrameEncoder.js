/* B"H
Boruch Hashem
Blessed is He

Each drawn frame enters native WebCodecs directly, while packet callbacks return
encoded H.264 to MediaBunny. The Awtsmoos renews order without wrapper deadlock.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.encodeDirectFrame = async function encodeDirectFrame(
	session,
	framePayload,
	frameIndex
) {
	await AnimatorVideo.drawFrame(
		{
			payload: session.config,
			ctx: session.ctx,
			canvas: session.canvas
		},
		framePayload
	);
	const frame = new VideoFrame(session.canvas, {
		timestamp: Math.max(
			0,
			Math.round(framePayload.time * 1_000_000)
		),
		duration: Math.max(
			1,
			Math.round(framePayload.duration * 1_000_000)
		)
	});
	try {
		session.encoder.encode(frame, {
			keyFrame: AnimatorVideo.isDirectKeyFrame(
				frameIndex,
				session.config.outputFormat.fps
			)
		});
	} finally {
		frame.close();
	}
	await AnimatorVideo.waitForDirectQueue(session, frameIndex + 1);
	session.lastQueuedTime = framePayload.time + framePayload.duration;
};

AnimatorVideo.waitForDirectQueue = async function waitForDirectQueue(
	session,
	frameNumber
) {
	const startedAt = performance.now();
	while (session.encoder.encodeQueueSize >= 3) {
		if (session.encoderError) {
			throw session.encoderError;
		}
		if (performance.now() - startedAt > 15000) {
			throw new Error(
				`Direct H.264 queue did not drain at frame ${frameNumber}.`
			);
		}
		await new Promise(resolve => setTimeout(resolve, 2));
	}
};

AnimatorVideo.isDirectKeyFrame = function isDirectKeyFrame(frameIndex, fps) {
	return frameIndex === 0 || frameIndex % Math.max(1, fps * 2) === 0;
};
