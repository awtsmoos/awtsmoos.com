// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals many chosen images inside one measured canvas without letting any finite image own the whole;
 * Awtsmoos.com preserves the original collage flow while scaling typography and spacing to the cover that actually exists.
 */
export class TiferesCoverRenderer {
	/** Render one validated specification into the intrinsic canvas without exporting it. */
	render(canvas, spec, images) {
		canvas.width = spec.widthPixels;
		canvas.height = spec.heightPixels;
		const context = canvas.getContext("2d");
		if (!context) {
			throw new Error("This browser could not create a 2D cover canvas.");
		}
		context.clearRect(0, 0, canvas.width, canvas.height);
		this.drawImages(context, images, canvas.width, canvas.height);
		this.drawText(context, spec.title, spec.subtitle, canvas.width, canvas.height);
	}

	/** Preserve the original row-based image arrangement with padding scaled to the current canvas. */
	drawImages(context, images, canvasWidth, canvasHeight) {
		const maxImageWidth = canvasWidth / 3;
		const maxImageHeight = canvasHeight / 3;
		const padding = Math.max(8, Math.min(20, Math.round(Math.min(canvasWidth, canvasHeight) * .035)));
		let x = padding;
		let y = padding;
		let rowHeight = 0;

		for (const image of images) {
			const scaleFactor = Math.min(
				maxImageWidth / image.naturalWidth,
				maxImageHeight / image.naturalHeight
			);
			const scaledWidth = image.naturalWidth * scaleFactor;
			const scaledHeight = image.naturalHeight * scaleFactor;
			if (x + scaledWidth + padding > canvasWidth) {
				x = padding;
				y += rowHeight + padding;
				rowHeight = 0;
			}
			context.drawImage(image, x, y, scaledWidth, scaledHeight);
			x += scaledWidth + padding;
			rowHeight = Math.max(rowHeight, scaledHeight);
		}
	}

	/** Preserve the original right-side title concept while adapting font scale to unusual dimensions. */
	drawText(context, title, subtitle, canvasWidth, canvasHeight) {
		const shortestSide = Math.min(canvasWidth, canvasHeight);
		const titleSize = Math.max(28, Math.min(80, Math.round(shortestSide * .14)));
		const subtitleSize = Math.max(18, Math.min(50, Math.round(shortestSide * .085)));
		const x = canvasWidth * .75;
		const yTitle = canvasHeight / 2 - titleSize * .62;
		const ySubtitle = canvasHeight / 2 + subtitleSize;
		context.textAlign = "center";
		context.strokeStyle = "black";
		context.fillStyle = "white";
		context.lineWidth = Math.max(2, Math.round(titleSize * .1));
		context.font = `bold ${titleSize}px Georgia`;
		context.strokeText(title, x, yTitle);
		context.fillText(title, x, yTitle);
		if (!subtitle) return;
		context.font = `italic ${subtitleSize}px Georgia`;
		context.strokeText(subtitle, x, ySubtitle);
		context.fillText(subtitle, x, ySubtitle);
	}
}
