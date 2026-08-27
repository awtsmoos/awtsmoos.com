/* B"H
 * Boruch Hashem
 * Blessed is He
 *
 * The Awtsmoos preserves the former background module as a compact compatibility
 * vessel that delegates to the focused deep-space, nebula, image, and portal laws.
 */

self.einSofRenderer.generateBg = function generateBackground(
	settings,
	resolution,
	bitmaps = [],
	time = 0
) {
	const canvas = new OffscreenCanvas(
		resolution.width,
		resolution.height
	);
	const context = canvas.getContext("2d");
	const baseColor = settings.regeneratePaletteColor
		|| settings.basePaletteColor
		|| "#8A2BE2";
	const palette = self.einSofRenderer.generatePalette(6, baseColor);
	const backgroundImage = bitmaps[0];
	if (backgroundImage instanceof ImageBitmap) {
		renderCompatibleImage(
			context,
			backgroundImage,
			settings,
			resolution
		);
	} else {
		self.einSofRenderer.renderDeepSpace?.(
			context,
			settings,
			resolution
		);
		self.einSofRenderer.renderNebula?.(
			context,
			settings,
			resolution,
			palette
		);
	}
	if (bitmaps.length > 1) {
		self.einSofRenderer.renderPortals?.(
			context,
			bitmaps.slice(1),
			settings,
			resolution,
			time
		);
	}
	return {
		canvas,
		palette
	};
};

self.einSofRenderer.renderNebulaBg = function renderNebulaBackground(
	context,
	settings,
	resolution,
	palette
) {
	self.einSofRenderer.renderDeepSpace?.(
		context,
		settings,
		resolution
	);
	self.einSofRenderer.renderNebula?.(
		context,
		settings,
		resolution,
		palette
	);
};

function renderCompatibleImage(context, image, settings, resolution) {
	if (self.einSofRenderer.renderBgImage) {
		self.einSofRenderer.renderBgImage(
			context,
			image,
			settings,
			resolution
		);
		return;
	}
	const imageRatio = image.width / image.height;
	const resolutionRatio = resolution.width / resolution.height;
	let width = resolution.width;
	let height = resolution.height;
	if (imageRatio > resolutionRatio) {
		width = resolution.height * imageRatio;
	} else {
		height = resolution.width / imageRatio;
	}
	context.save();
	context.globalAlpha = settings.backgroundOpacity ?? 1;
	context.drawImage(
		image,
		(resolution.width - width) / 2,
		(resolution.height - height) / 2,
		width,
		height
	);
	context.restore();
}
