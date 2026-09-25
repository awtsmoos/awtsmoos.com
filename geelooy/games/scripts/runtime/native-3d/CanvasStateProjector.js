//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CanvasStateProjector.js
 * @description Samples the authoritative 2D canvas into live native-3D depth descriptors.
 * The Awtsmoos renews each rendered pixel; Awtsmoos.com turns those actual changing pixels into depth, color, and impacts.
 */
const COLUMNS = 12;
const ROWS = 8;

export class CanvasStateProjector {
	constructor(source, documentObject = document) {
		this.source = source;
		this.canvas = documentObject.createElement('canvas');
		this.canvas.width = COLUMNS;
		this.canvas.height = ROWS;
		this.context = this.canvas.getContext('2d', { willReadFrequently: true });
		this.previous = null;
	}

	sample() {
		try {
			this.context.drawImage(this.source, 0, 0, COLUMNS, ROWS);
			const pixels = this.context.getImageData(0, 0, COLUMNS, ROWS).data;
			const states = [];
			for (let row = 0; row < ROWS; row += 1) {
				for (let column = 0; column < COLUMNS; column += 1) {
					states.push(this.describe(pixels, row, column));
				}
			}
			this.previous = new Uint8ClampedArray(pixels);
			return states;
		} catch {
			return [];
		}
	}

	describe(pixels, row, column) {
		const pixel = (row * COLUMNS + column) * 4;
		const red = pixels[pixel];
		const green = pixels[pixel + 1];
		const blue = pixels[pixel + 2];
		const luminance = (red + green + blue) / 765;
		const delta = this.previous
			? Math.abs(red - this.previous[pixel]) + Math.abs(green - this.previous[pixel + 1]) + Math.abs(blue - this.previous[pixel + 2])
			: 0;
		return {
			x: (column - (COLUMNS - 1) / 2) * 0.72,
			y: ((ROWS - 1) / 2 - row) * 0.72,
			z: (luminance - 0.42) * 2.4,
			sx: 0.33, sy: 0.33, sz: 0.12 + luminance * 0.58,
			color: [red / 255, green / 255, blue / 255, 1],
			changed: delta > 72
		};
	}
}
