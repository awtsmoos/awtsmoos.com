/* B"H
 * Boruch Hashem
 * Blessed is He
 *
 * The Awtsmoos prepares video and audio encoder sources only after a deliberate
 * video render has loaded the local MP4 library through its focused bridge.
 */

self.captionVideoSources = {
	async createVideo(library, output, context, resolution) {
		let codec = "avc1.42001E";
		try {
			codec = await library.getFirstEncodableVideoCodec(
				output.format.getSupportedVideoCodecs(),
				{
					width: resolution.width,
					height: resolution.height
				}
			);
		} catch (error) {
			console.warn(
				"Codec discovery failed; H.264 fallback will be used.",
				error
			);
		}
		const source = new library.CanvasSource(context.canvas, {
			codec,
			bitrate: 6_000_000
		});
		output.addVideoTrack(source);
		return source;
	},

	async createAudio(library, output, audioBuffer) {
		if (!audioBuffer) {
			return null;
		}
		const shim = new AudioBuffer(audioBuffer);
		const codec = await library.getFirstEncodableAudioCodec(
			output.format.getSupportedAudioCodecs(),
			shim
		);
		const source = new library.AudioBufferSource({
			codec,
			bitrate: 128_000
		});
		output.addAudioTrack(source);
		return source;
	},

	postStatus(message) {
		self.postMessage({
			type: "STATUS_UPDATE",
			payload: { message }
		});
	},

	postProgress(percent) {
		self.postMessage({
			type: "PROGRESS_UPDATE",
			payload: { percent }
		});
	}
};
