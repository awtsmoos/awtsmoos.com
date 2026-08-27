// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets speech rest inside a luminous boundary without becoming trapped by it;
 * Awtsmoos.com owns the caption vessel here while typography painting flows through its own dedicated light.
 */
import { OhrLayer } from "./OhrLayer.js";
import { OhrPalette } from "./OhrPalette.js";
import { TiferesTextLayout } from "./TiferesTextLayout.js";
import { TiferesTextPainter } from "./TiferesTextPainter.js";

export class TiferesText extends OhrLayer {
	render(scene) {
		const padding = Math.max(0, Number(scene.settings.boxPadding || 0));
		const radius = Math.max(0, Number(scene.settings.boxRadius || 0));
		const maximumWidth = scene.width * .9 - padding * 2;
		const maximumHeight = scene.height * .4 - padding * 2;
		const lines = TiferesTextLayout.calculate(
			this.context,
			scene.caption,
			scene.header,
			maximumWidth,
			maximumHeight
		);
		if (!lines.length) {
			return;
		}

		const bounds = this.measureBounds(lines, padding, scene);
		this.drawBlurredVessel(bounds, scene, radius);
		this.drawBorder(bounds, scene, radius);
		new TiferesTextPainter(this.context).drawLines(lines, bounds, scene);
	}

	measureBounds(lines, padding, scene) {
		let maximumLineWidth = 0;
		lines.forEach(line => {
			this.context.font = `700 ${line.fontSize}px system-ui`;
			maximumLineWidth = Math.max(
				maximumLineWidth,
				this.context.measureText(line.text).width
			);
		});
		const textHeight = lines.reduce((sum, line) => sum + line.height, 0);
		const width = maximumLineWidth + padding * 2;
		const height = textHeight + padding * 2;
		return {
			x: (scene.width - width) / 2,
			y: (scene.height - height) / 2,
			width,
			height,
			padding
		};
	}

	drawBlurredVessel(bounds, scene, radius) {
		const snapshot = this.context.getImageData(
			bounds.x,
			bounds.y,
			bounds.width,
			bounds.height
		);
		const blurCanvas = new OffscreenCanvas(bounds.width, bounds.height);
		const blurContext = blurCanvas.getContext("2d", { willReadFrequently: true });
		blurContext.putImageData(snapshot, 0, 0);
		blurContext.filter = "blur(15px) brightness(.8)";
		blurContext.drawImage(blurCanvas, 0, 0);

		this.withSavedContext(this.context, () => {
			this.context.beginPath();
			this.context.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, radius);
			this.context.clip();
			this.context.drawImage(blurCanvas, bounds.x, bounds.y);
			this.context.fillStyle = OhrPalette.hexToRgba(
				scene.settings.boxColor,
				Number(scene.settings.boxOpacity || 0)
			);
			this.context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
		});
	}

	drawBorder(bounds, scene, radius) {
		const gradient = this.context.createLinearGradient(
			bounds.x,
			bounds.y,
			bounds.x + bounds.width,
			bounds.y + bounds.height
		);
		gradient.addColorStop(0, scene.palette.cyan);
		gradient.addColorStop(.5, scene.palette.gold);
		gradient.addColorStop(1, scene.palette.violet);
		this.context.strokeStyle = gradient;
		this.context.lineWidth = 2.5;
		this.context.shadowColor = scene.palette.gold;
		this.context.shadowBlur = 15;
		this.context.beginPath();
		this.context.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, radius);
		this.context.stroke();
		this.context.shadowColor = "transparent";
	}
}
