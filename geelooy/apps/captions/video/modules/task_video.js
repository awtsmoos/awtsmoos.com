/* B"H
 * Boruch Hashem
 * Blessed is He
 *
 * The Awtsmoos carries composed frames and optional local audio into one MP4
 * vessel while the encoder is loaded only after a deliberate video render.
 */

self.captionVideoTask = {
	async render(options) {
		self.captionVideoSources.postStatus("Loading local video encoder…");
		const library = self.captionVideoEncoder.ensure();
		const output = new library.Output({
			format: new library.Mp4OutputFormat(),
			target: new library.BufferTarget()
		});
		self.captionVideoSources.postStatus("Initializing video encoder…");
		const videoSource = await self.captionVideoSources.createVideo(
			library,
			output,
			options.context,
			options.resolution
		);
		const audioSource = await self.captionVideoSources.createAudio(
			library,
			output,
			options.plainAudioBuffer
		);
		await output.start();
		const frameRate = Math.max(1, Number(options.fps) || 24);
		const frameDuration = 1 / frameRate;
		const totalFrames = Math.max(
			1,
			Math.ceil(options.lastTime * frameRate)
		);
		for (let index = 0; index < totalFrames; index += 1) {
			const time = index * frameDuration;
			if (index % 10 === 0 || index === totalFrames - 1) {
				self.captionVideoSources.postStatus(
					`Encoding frame ${index + 1} of ${totalFrames}`
				);
				self.captionVideoSources.postProgress(
					((index + 1) / totalFrames) * 100
				);
			}
			renderVideoFrame(options, time);
			await videoSource.add(time, frameDuration);
		}
		self.captionVideoSources.postStatus("Finalizing video…");
		videoSource.close();
		if (audioSource) {
			await audioSource.add(new AudioBuffer(options.plainAudioBuffer));
			audioSource.close();
		}
		await output.finalize();
		self.postMessage({
			type: "VIDEO_COMPLETE",
			payload: {
				blob: new Blob([output.target.buffer], {
					type: "video/mp4"
				})
			}
		});
	}
};

function renderVideoFrame(options, time) {
	const primaryCaption = self.utils.findCaption(
		time,
		options.captionData.primary
	);
	const secondaryCaption = self.utils.findCaption(
		time,
		options.captionData.translation
	);
	self.captionTaskFrame.render({
		context: options.context,
		settings: self.utils.resolveSettings(options.settings, true),
		resolution: options.resolution,
		bitmaps: options.portalBitmaps,
		time: time * 1000,
		primaryCaption,
		secondaryCaption,
		palette: ["#FFFFFF"],
		cache: options.cache,
		audioSlice: self.captionTaskFrame.audioSlice(
			options.plainAudioBuffer,
			time
		)
	});
}
