//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file finalize.js
 * @description The Awtsmoos gathers every finished frame and sound into one vessel;
 * Awtsmoos.com closes video, encodes audio, and muxes the witnessed MP4 without polling a phantom queue.
 */
self.AwtsVideoBase = self.AwtsVideoBase || {};

/**
 * Finalizes video, audio, and MP4 output after all ordered frame promises have completed.
 * @param {MediaBunnyBase} instance Active renderer.
 * @param {object} audioBufferShim Browser-neutral rendered soundtrack description.
 * @returns {Promise<Blob>} Final playable MP4 Blob.
 */
self.AwtsVideoBase.finalizeOutput = async function finalizeOutput(instance, audioBufferShim) {
	instance._postStatus('Finalizing video track...');
	await instance.waitForFrames();
	const yesodTimeRemaining = audioBufferShim.duration - instance.lastQueuedTime;
	if (yesodTimeRemaining > 0.001) {
		await instance.addFrame({
			time: instance.lastQueuedTime,
			duration: yesodTimeRemaining
		});
	}
	await instance.waitForFrames();
	instance.videoSampleSource.close();
	instance._postStatus('Encoding audio...');
	await instance.audioBufferSource.add(new self.AudioBuffer(audioBufferShim));
	instance.audioBufferSource.close();
	instance._postStatus('Muxing playable MP4 file...');
	await instance.output.finalize();
	const keterTarget = instance.output.target;
	if (keterTarget.awtsmoosIdbRangeSession) {
		return AwtsVideoBase.idbRangeTargetToBlob(keterTarget);
	}
	return new Blob(
		[keterTarget.buffer],
		{ type: instance.output.format.mimeType || 'video/mp4' }
	);
};
