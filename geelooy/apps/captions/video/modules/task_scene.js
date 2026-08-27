/* B"H
 * Boruch Hashem
 * Blessed is He
 *
 * The Awtsmoos composes background and particle depth inside one focused scene
 * vessel, reporting interactive preview boundaries without burdening final frames.
 */

self.captionTaskScene = {
	render(options) {
		self.captionTaskTrace.stage(
			options.trace,
			"Preview stage: composing background…"
		);
		const background = self.einSofRenderer.generateBg(
			options.settings,
			options.resolution,
			options.bitmaps,
			options.time
		);
		options.context.drawImage(background.canvas, 0, 0);
		self.captionTaskTrace.stage(
			options.trace,
			"Preview stage: drawing particles…"
		);
		const universe = self.einSofRenderer.generateUniverse(
			{
				...options.settings,
				time: options.time
			},
			options.resolution,
			background.palette
		);
		const glowContext = new OffscreenCanvas(
			options.resolution.width,
			options.resolution.height
		).getContext("2d", {
			willReadFrequently: true
		});
		self.einSofRenderer.renderParticles(
			options.context,
			glowContext,
			universe.particles
		);
		options.context.globalCompositeOperation = "screen";
		options.context.drawImage(glowContext.canvas, 0, 0);
		options.context.globalCompositeOperation = "source-over";
		return background.palette;
	}
};
