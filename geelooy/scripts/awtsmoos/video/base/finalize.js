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
 * @param {object|null} audioBufferShim Browser-neutral rendered soundtrack description,
 * or null when the session carries no audio (AAC unavailable or audio declined):
 * the MP4 is then muxed with no audio track instead of encoding silence through
 * an encoder configuration the browser already refused.
 * @param {object} [options] Finalize evidence; durationSeconds supplies the
 * movie duration for the tail-frame fill when no audio shim carries it.
 * @returns {Promise<Blob>} Final playable MP4 Blob.
 */
self.AwtsVideoBase.finalizeOutput = async function finalizeOutput(instance, audioBufferShim, options = {}) {
	instance._postStatus('Finalizing video track...');
	await instance.waitForFrames();
	const yesodDuration = Number.isFinite(options.durationSeconds)
		? options.durationSeconds
		: audioBufferShim?.duration;
	const yesodTimeRemaining = Number.isFinite(yesodDuration)
		? yesodDuration - instance.lastQueuedTime
		: 0;
	if (yesodTimeRemaining > 0.001) {
		await instance.addFrame({
			time: instance.lastQueuedTime,
			duration: yesodTimeRemaining
		});
	}
	await instance.waitForFrames();
	instance.videoSampleSource.close();
	if (instance.audioBufferSource && audioBufferShim) {
		instance._postStatus('Encoding audio...');
		await instance.audioBufferSource.add(new self.AudioBuffer(audioBufferShim));
		instance.audioBufferSource.close();
	} else {
		instance._postStatus('No audio track: muxing a silent MP4...');
	}
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
