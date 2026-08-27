/* B"H
Boruch Hashem
Blessed is He

The last frame is not the last covenant. The Awtsmoos renews video closure, audio
closure, mux completion, and Blob revelation in an explicit awaited procession.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.finalizeRenderer = async function finalizeRenderer(
	renderer,
	audioBufferShim
) {
	await AnimatorVideo.completeDuration(renderer, audioBufferShim);
	AnimatorVideo.finalizerStatus('Awaiting video encoder close...');
	await AnimatorVideo.closeSource(renderer.videoSampleSource);
	AnimatorVideo.finalizerStatus('Video encoder closed. Encoding audio...');
	await renderer.audioBufferSource.add(
		new self.AudioBuffer(audioBufferShim)
	);
	AnimatorVideo.finalizerStatus('Awaiting audio encoder close...');
	await AnimatorVideo.closeSource(renderer.audioBufferSource);
	AnimatorVideo.finalizerStatus('Audio encoder closed. Finalizing MP4 output...');
	await renderer.output.finalize();
	AnimatorVideo.finalizerStatus('MP4 output finalized. Reading browser bytes...');
	return AnimatorVideo.outputBlob(renderer);
};

AnimatorVideo.completeDuration = async function completeDuration(
	renderer,
	audioBufferShim
) {
	const remaining = audioBufferShim.duration - renderer.lastQueuedTime;
	if (remaining <= 0.001) {
		return;
	}
	await AnimatorVideo.encodeFrame(renderer, {
		time: renderer.lastQueuedTime,
		duration: remaining
	});
};

AnimatorVideo.closeSource = async function closeSource(source) {
	if (!source) {
		throw new Error('Browser media source is missing during finalization.');
	}
	source.close();
	if (source._closingPromise) {
		await source._closingPromise;
		return;
	}
	if (typeof source._flushAndClose === 'function') {
		await source._flushAndClose();
	}
};

AnimatorVideo.outputBlob = function outputBlob(renderer) {
	const target = renderer.output.target;
	if (target.awtsmoosIdbRangeSession) {
		return AwtsVideoBase.idbRangeTargetToBlob(target);
	}
	return new Blob(
		[target.buffer],
		{ type: renderer.output.format.mimeType || 'video/mp4' }
	);
};

AnimatorVideo.finalizerStatus = function finalizerStatus(message) {
	self.postMessage({
		type: 'STATUS_UPDATE',
		payload: { message }
	});
};
