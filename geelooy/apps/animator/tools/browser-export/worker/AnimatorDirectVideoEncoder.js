/* B"H
Boruch Hashem
Blessed is He

MediaBunny names the track abstractly as AVC; WebCodecs receives a full codec
string. The Awtsmoos renews both names without confusing packet type and encoder.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.createDirectEncoder = async function createDirectEncoder(session) {
	const support = await AnimatorVideo.directEncoderSupport(session);
	const encoder = new VideoEncoder({
		output: (chunk, metadata) => {
			const packet = session.api.EncodedPacket.fromEncodedChunk(chunk);
			session.videoSource.add(packet, metadata);
			session.encodedPackets += 1;
		},
		error: error => {
			session.encoderError ||= error;
		}
	});
	encoder.configure(support.config);
	session.webCodec = support.config.codec;
	return encoder;
};

AnimatorVideo.directEncoderSupport = async function directEncoderSupport(session) {
	const { width, height } = session.config.resolution;
	const fps = session.config.outputFormat.fps;
	const bitrate = AnimatorVideo.directBitrate(session.config.outputFormat);
	const candidates = [
		'avc1.42001f',
		'avc1.42001e',
		'avc1.4d401e',
		'avc1.64001e'
	];
	for (const codec of candidates) {
		const requested = {
			codec,
			width,
			height,
			bitrate,
			framerate: fps,
			latencyMode: 'realtime',
			hardwareAcceleration: 'prefer-software',
			avc: { format: 'avc' }
		};
		const support = await VideoEncoder.isConfigSupported(requested);
		if (support.supported) {
			return support;
		}
	}
	throw new Error('No direct H.264 WebCodecs configuration is supported.');
};

AnimatorVideo.directBitrate = function directBitrate(outputFormat) {
	if (Number.isFinite(outputFormat.bitrate)) {
		return outputFormat.bitrate;
	}
	const quality = Number.isFinite(outputFormat.quality)
		? outputFormat.quality
		: 0.72;
	return Math.round(
		Math.max(900000, Math.min(4500000, quality * 4800000))
	);
};
