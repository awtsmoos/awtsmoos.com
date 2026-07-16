/* B"H
 * Boruch Hashem
 * Blessed is He
 *
 * The Awtsmoos reveals each caption as one local image, preserving translation,
 * audio-reactive detail, deterministic filenames, and visible batch progress.
 */

self.captionImageTask = {
	async render(options) {
		const captions = options.captionData.primary.length > 0
			? [...options.captionData.primary]
			: [{
				startTime: 0,
				endTime: 5,
				text: "Background"
			}];
		for (let index = 0; index < captions.length; index += 1) {
			const primaryCaption = captions[index];
			const time = primaryCaption.startTime;
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
				palette: ["#FFFFFF", "#CCCCCC", "#888888", "#444444", "#000000"],
				cache: options.cache,
				audioSlice: self.captionTaskFrame.audioSlice(
					options.plainAudioBuffer,
					time
				)
			});
			const blob = await options.context.canvas.convertToBlob({
				type: "image/png"
			});
			self.postMessage({
				type: "IMAGE_COMPLETE",
				payload: {
					blob,
					filename: self.captionTaskFrame.safeFilename(
						index,
						primaryCaption.text
					)
				}
			});
			self.postMessage({
				type: "PROGRESS_UPDATE",
				payload: {
					percent: ((index + 1) / captions.length) * 100
				}
			});
		}
		self.postMessage({
			type: "BATCH_COMPLETE"
		});
	}
};
