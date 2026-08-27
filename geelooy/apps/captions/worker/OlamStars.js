// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos scatters countless sparks through the apparent darkness;
 * Awtsmoos.com paints distant stars, hero lights, and passing meteors without letting ornament overwhelm the caption.
 */
import { ChesedRandom } from "./ChesedRandom.js";
import { OhrPalette } from "./OhrPalette.js";

export class OlamStars {
	static render(context, width, height, palette) {
		this.renderDistant(context, width, height, palette);
		this.renderHero(context, width, height, palette);
		this.renderMeteors(context, width, height, palette);
	}

	static renderDistant(context, width, height, palette) {
		for (let index = 0; index < 950; index += 1) {
			const x = Math.random() * width;
			const y = Math.random() * height;
			const radius = ChesedRandom.number(.25, 1.35);
			const alpha = ChesedRandom.number(.08, .58);
			context.fillStyle = OhrPalette.hexToRgba(
				index % 7 === 0 ? palette.cyan : palette.mist,
				alpha
			);
			context.beginPath();
			context.arc(x, y, radius, 0, Math.PI * 2);
			context.fill();
		}
	}

	static renderHero(context, width, height, palette) {
		for (let index = 0; index < 16; index += 1) {
			const x = ChesedRandom.number(width * .06, width * .94);
			const y = ChesedRandom.number(height * .04, height * .78);
			const radius = ChesedRandom.number(2.5, 7);
			const gradient = context.createRadialGradient(
				x,
				y,
				0,
				x,
				y,
				radius * 8
			);
			gradient.addColorStop(0, "rgba(255,255,255,.96)");
			gradient.addColorStop(.12, OhrPalette.hexToRgba(palette.cyan, .72));
			gradient.addColorStop(1, OhrPalette.hexToRgba(palette.cyan, 0));
			context.fillStyle = gradient;
			context.beginPath();
			context.arc(x, y, radius * 8, 0, Math.PI * 2);
			context.fill();
		}
	}

	static renderMeteors(context, width, height, palette) {
		for (let index = 0; index < 3; index += 1) {
			const x = ChesedRandom.number(width * .08, width * .82);
			const y = ChesedRandom.number(height * .06, height * .42);
			const length = ChesedRandom.number(90, 260);
			const gradient = context.createLinearGradient(x, y, x + length, y + length * .35);
			gradient.addColorStop(0, OhrPalette.hexToRgba(palette.gold, .72));
			gradient.addColorStop(1, OhrPalette.hexToRgba(palette.gold, 0));
			context.strokeStyle = gradient;
			context.lineWidth = ChesedRandom.number(1.2, 2.8);
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(x + length, y + length * .35);
			context.stroke();
		}
	}
}
