// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets finite vision carry texture without losing the truth beneath;
 * Awtsmoos.com applies grain, vignette, scan rhythm, and chromatic edge only after composition is complete.
 */
import { OhrLayer } from "./OhrLayer.js";

export class HodPost extends OhrLayer {
	render(scene) {
		const imageData = this.context.getImageData(0, 0, scene.width, scene.height);
		const pixels = imageData.data;
		const source = new Uint8ClampedArray(pixels);
		const centerX = scene.width / 2;
		const centerY = scene.height / 2;
		const maximumDistance = Math.hypot(centerX, centerY);
		const grainStrength = Number(scene.settings.filmGrain || 0);

		for (let index = 0; index < pixels.length; index += 4) {
			const pixel = index / 4;
			const x = pixel % scene.width;
			const y = Math.floor(pixel / scene.width);
			const distance = Math.hypot(x - centerX, y - centerY);
			const normalized = distance / maximumDistance;
			const vignette = Math.pow(normalized, 2) * .98;
			const scan = y % 3 === 0 ? .95 : 1;
			const grain = (Math.random() - .5) * grainStrength;
			const offset = Math.floor(Math.pow(normalized, 2.5) * 12);
			const redIndex = this.sourceIndex(x - offset, y, scene.width, scene.height);
			const blueIndex = this.sourceIndex(x + offset, y, scene.width, scene.height);
			const red = source[redIndex] ?? source[index];
			const green = source[index + 1];
			const blue = source[blueIndex + 2] ?? source[index + 2];
			const light = (1 - vignette) * scan;
			pixels[index] = Math.max(0, red * light + grain);
			pixels[index + 1] = Math.max(0, green * light + grain);
			pixels[index + 2] = Math.max(0, blue * light + grain);
		}

		this.context.putImageData(imageData, 0, 0);
	}

	sourceIndex(x, y, width, height) {
		if (x < 0 || x >= width || y < 0 || y >= height) {
			return -4;
		}
		return (y * width + x) * 4;
	}
}
