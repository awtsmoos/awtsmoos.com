/* B"H
 * Boruch Hashem
 * Blessed is He
 *
 * The Awtsmoos coordinates one frame after scene composition, text, components,
 * and effects have each received an observable and independently owned boundary.
 */

self.captionTaskFrame = {
	createContext(resolution) {
		return new OffscreenCanvas(
			resolution.width,
			resolution.height
		).getContext("2d", {
			willReadFrequently: true
		});
	},

	safeFilename(index, text) {
		const safeText = String(text || "caption")
			.replace(/<[^>]*>/g, "")
			.replace(/[^a-z0-9\u0590-\u05FF]/gi, "_")
			.replace(/_+/g, "_")
			.slice(0, 30);
		return `${String(index + 1).padStart(3, "0")}_${safeText}.png`;
	},

	audioSlice(audioBuffer, time) {
		const channel = audioBuffer?.channels?.[0];
		if (!channel) return null;
		const startIndex = Math.floor(time * audioBuffer.sampleRate);
		return channel.subarray(startIndex, startIndex + 1024);
	},

	render(options) {
		const palette = self.captionTaskScene.render(options);
		self.captionTaskTrace.stage(
			options.trace,
			"Preview stage: laying out captions…"
		);
		self.einSofRenderer.renderHeader(
			options.context,
			options.settings.headerText || "",
			options.resolution
		);
		self.einSofRenderer.renderText(
			options.context,
			options.primaryCaption?.text || null,
			options.secondaryCaption?.text || null,
			options.settings,
			options.resolution,
			palette,
			options.cache
		);
		self.captionTaskTrace.stage(
			options.trace,
			"Preview stage: drawing overlays…"
		);
		self.einSofRenderer.renderVCRStamp(
			options.context,
			options.resolution,
			options.settings.enableVCRStamp === true
		);
		self.einSofRenderer.renderWaveform(
			options.context,
			options.resolution,
			options.audioSlice,
			options.settings.enableWaveform === true
		);
		self.captionTaskTrace.stage(
			options.trace,
			"Preview stage: applying effects…"
		);
		self.einSofRenderer.applyFX(
			options.context,
			options.settings,
			options.resolution
		);
		self.captionTaskTrace.stage(
			options.trace,
			"Preview stage: packaging frame…"
		);
	}
};
