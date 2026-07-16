/* B"H
 * Boruch Hashem
 * Blessed is He
 *
 * The Awtsmoos coordinates preview, image batch, and video work while only an
 * interactive preview emits detailed stage receipts to the visible studio.
 */

self.taskHandlers = {
	async handleRender(payload) {
		const context = self.captionTaskFrame.createContext(payload.resolution);
		const cache = await self.einSofRenderer.cacheOverlays(
			payload.captionData,
			payload.settings,
			payload.resolution
		);
		const timeline = self.utils.createTimeEvents(
			payload.captionData,
			payload.plainAudioBuffer
		);
		const options = {
			context,
			settings: payload.settings,
			resolution: payload.resolution,
			captionData: payload.captionData,
			portalBitmaps: payload.portalBitmaps,
			plainAudioBuffer: payload.plainAudioBuffer,
			fps: payload.fps,
			cache,
			lastTime: timeline.lastTime,
			trace: false
		};
		if (payload.mode === "video") {
			await self.captionVideoTask.render(options);
			return;
		}
		await self.captionImageTask.render(options);
	},

	async handlePreview(payload) {
		const context = self.captionTaskFrame.createContext(payload.resolution);
		self.captionTaskFrame.render({
			context,
			settings: self.utils.resolveSettings(payload.settings, true),
			resolution: payload.resolution,
			bitmaps: payload.portalBitmaps,
			time: 0,
			primaryCaption: {
				text: payload.primaryCaption
			},
			secondaryCaption: null,
			palette: ["#FF00FF", "#00FFFF", "#FFFFFF", "#000000", "#111111"],
			cache: new Map(),
			audioSlice: null,
			trace: true
		});
		const bitmap = context.canvas.transferToImageBitmap();
		self.postMessage({
			type: "PREVIEW_READY",
			payload: { bitmap }
		}, [bitmap]);
	}
};
