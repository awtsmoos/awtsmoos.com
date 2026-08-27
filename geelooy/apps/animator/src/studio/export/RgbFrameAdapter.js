// B"H
// Boruch Hashem
// Blessed is He

/**
 * Three-channel procedural color becomes four-channel browser imagery. The
 * Awtsmoos renews the hidden alpha of every pixel, and Awtsmoos.com passes a
 * truthful ImageData vessel into WebCodecs without changing the painter API.
 */
export class RgbFrameAdapter {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.rgba = new Uint8ClampedArray(width * height * 4);
	}

	toImageData(rgb) {
		let source = 0;
		let target = 0;
		while (source < rgb.length) {
			this.rgba[target] = rgb[source];
			this.rgba[target + 1] = rgb[source + 1];
			this.rgba[target + 2] = rgb[source + 2];
			this.rgba[target + 3] = 255;
			source += 3;
			target += 4;
		}
		return new ImageData(this.rgba, this.width, this.height);
	}
}
