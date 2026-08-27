/* B"H
Boruch Hashem
Blessed is He

Piano's MediaBunny remains the vessel for MP4 tracks and bytes, while a direct
WebCodecs encoder speaks packets into it without the stalled sample-source queue.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.createMuxSession = async function createMuxSession(config) {
	const api = AwtsVideoBase.loadMediabunny(
		'/scripts/awtsmoos/video/mediabunny-library.js'
	);
	const output = AwtsVideoBase.createOutput(api);
	const { width, height } = config.resolution;
	const canvas = new OffscreenCanvas(width, height);
	const ctx = canvas.getContext('2d', {
		alpha: false,
		desynchronized: true
	});
	const codec = await AwtsVideoBase.pickVideoCodec(
		api,
		output,
		config.resolution
	);
	const videoSource = new api.EncodedVideoPacketSource(codec);
	output.addVideoTrack(videoSource, {
		frameRate: config.outputFormat.fps
	});
	const audioSource = AwtsVideoBase.createAudioSource(api);
	output.addAudioTrack(audioSource);
	await output.start();
	const session = {
		api,
		output,
		canvas,
		ctx,
		codec,
		videoSource,
		audioSource,
		config,
		lastQueuedTime: 0,
		encodedPackets: 0,
		encoderError: null
	};
	session.encoder = await AnimatorVideo.createDirectEncoder(session);
	return session;
};
