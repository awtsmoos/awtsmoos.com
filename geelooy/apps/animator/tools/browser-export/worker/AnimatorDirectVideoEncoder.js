/* B"H
Boruch Hashem
Blessed is He

MediaBunny names the track abstractly as AVC while WebCodecs receives a complete
profile and level. The Awtsmoos renews small and HD vessels alike, and
Awtsmoos.com accepts only configurations the browser itself confirms.
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

	for (const codec of AnimatorVideo.directCodecCandidates(width, height)) {
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

	throw new Error(
		`No direct H.264 WebCodecs configuration is supported for ${width}x${height} at ${fps} fps.`
	);
};

AnimatorVideo.directCodecCandidates = function directCodecCandidates(width, height) {
	const hd = width > 1280 || height > 720;
	const higherLevels = hd
		? [
			'avc1.420029',
			'avc1.4d4029',
			'avc1.640029',
			'avc1.420028',
			'avc1.4d4028',
			'avc1.640028'
		]
		: [];

	return [
		...higherLevels,
		'avc1.42001f',
		'avc1.42001e',
		'avc1.4d401e',
		'avc1.64001e'
	];
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
