//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tracks.js
 * @description The Awtsmoos is beyond codec and container, while Awtsmoos.com
 * chooses truthful H.264/AAC vessels whose quality and storage limits remain explicit in every render.
 */
self.AwtsVideoBase = self.AwtsVideoBase || {};

/** Creates the MP4 output with low-memory IndexedDB storage when the browser supports it. */
self.AwtsVideoBase.createOutput = function createOutput(api) {
	const keterFormat = new api.Mp4OutputFormat({
		fastStart: 'in-memory'
	});
	const yesodTarget = AwtsVideoBase.createIdbRangeTarget?.(api, 'video/mp4');
	return new api.Output({
		format: keterFormat,
		target: yesodTarget || new api.BufferTarget()
	});
};

/** Selects the strongest supported AVC codec while retaining a baseline fallback. */
self.AwtsVideoBase.pickVideoCodec = async function pickVideoCodec(api, output, resolution) {
	const keliCodecs = [
		'avc1.42001E',
		'avc1.4D401E',
		'avc1.64001E'
	];
	for (const yesodCodec of keliCodecs) {
		try {
			const yesodSupported = await api.canEncodeVideo(yesodCodec, {
				width: resolution.width,
				height: resolution.height
			});
			if (yesodSupported) {
				return yesodCodec;
			}
		} catch (error) {
			console.warn(`Codec probe failed for ${yesodCodec}.`, error.message);
		}
	}
	try {
		return await api.getFirstEncodableVideoCodec(
			output.format.getSupportedCodecs(),
			resolution
		);
	} catch (error) {
		console.warn(
			'Dynamic video codec check failed, using AVC baseline fallback.',
			error.message
		);
		return 'avc1.42001E';
	}
};

/** Creates the MediaBunny video sample source using an explicit bounded bitrate. */
self.AwtsVideoBase.createVideoSource = function createVideoSource(api, codec, outputFormat) {
	const yesodQuality = Number.isFinite(outputFormat.quality)
		? outputFormat.quality
		: 0.55;
	const yesodBitrate = outputFormat.bitrate || Math.round(
		Math.max(800_000, Math.min(3_500_000, yesodQuality * 4_500_000))
	);
	return new api.VideoSampleSource({
		codec,
		bitrate: yesodBitrate
	});
};

/** Creates the AAC source shared by canonical and production Animator exports. */
self.AwtsVideoBase.createAudioSource = function createAudioSource(api) {
	return new api.AudioBufferSource({
		codec: 'aac',
		bitrate: 96_000
	});
};
