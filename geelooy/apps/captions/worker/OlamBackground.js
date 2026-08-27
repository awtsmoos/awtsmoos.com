// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives depth before detail, darkness before luminous form;
 * Awtsmoos.com paints one quiet cosmic field where captions and particles can appear without visual storm.
 */
import { OhrLayer } from "./OhrLayer.js";
import { OlamStars } from "./OlamStars.js";
import { OhrPalette } from "./OhrPalette.js";

export class OlamBackground extends OhrLayer {
	render(scene) {
		const { context } = this;
		const { width, height, palette } = scene;
		this.drawBase(context, width, height, palette);
		this.drawNebulae(context, width, height, palette);
		OlamStars.render(context, width, height, palette);
	}

	drawBase(context, width, height, palette) {
		context.fillStyle = palette.base;
		context.fillRect(0, 0, width, height);

		const gradient = context.createRadialGradient(
			width * .5,
			height * .38,
			60,
			width * .5,
			height * .48,
			height * .72
		);
		gradient.addColorStop(0, OhrPalette.hexToRgba(palette.violet, .18));
		gradient.addColorStop(.42, OhrPalette.hexToRgba(palette.cyan, .06));
		gradient.addColorStop(1, "rgba(0,0,0,0)");
		context.fillStyle = gradient;
		context.fillRect(0, 0, width, height);
	}

	drawNebulae(context, width, height, palette) {
		const nebulae = [
			[.2, .24, palette.violet],
			[.78, .36, palette.cyan],
			[.42, .76, palette.gold],
			[.72, .82, palette.violet]
		];

		nebulae.forEach(([xRatio, yRatio, color], index) => {
			const x = width * xRatio;
			const y = height * yRatio;
			const radius = width * (.22 + index * .025);
			const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
			gradient.addColorStop(0, OhrPalette.hexToRgba(color, .12));
			gradient.addColorStop(.45, OhrPalette.hexToRgba(color, .045));
			gradient.addColorStop(1, OhrPalette.hexToRgba(color, 0));
			context.fillStyle = gradient;
			context.beginPath();
			context.arc(x, y, radius, 0, Math.PI * 2);
			context.fill();
		});
	}
}
