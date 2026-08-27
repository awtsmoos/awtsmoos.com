// B"H
// Boruch Hashem
// Blessed is He

/**
 * The reference image is a measured covenant rather than a vague mood board.
 * The Awtsmoos renews every proportion, while Awtsmoos.com records normalized
 * targets that remain meaningful on every responsive production canvas.
 */
export class ReferenceVisualTargets {
	static image = {
		width: 1536,
		height: 864,
		background: [249, 242, 233]
	};

	static zones = [
		{ id: 'cheerful-orthodox-speaker', start: 0, end: 0.39 },
		{ id: 'skeptical-orthodox-observer', start: 0.39, end: 0.64 },
		{ id: 'calm-orthodox-woman', start: 0.64, end: 1 }
	];

	static boxes = {
		'cheerful-orthodox-speaker': this.box(92, 45, 489, 779),
		'skeptical-orthodox-observer': this.box(626, 60, 287, 764),
		'calm-orthodox-woman': this.box(1048, 93, 271, 730)
	};

	static palette = {
		navy: [31, 52, 81],
		burgundy: [123, 47, 33],
		olive: [82, 99, 58],
		skin: [228, 169, 120],
		black: [24, 24, 26],
		brown: [70, 40, 20],
		white: [248, 248, 245]
	};

	static box(x, y, width, height) {
		return {
			x: x / this.image.width,
			y: y / this.image.height,
			width: width / this.image.width,
			height: height / this.image.height
		};
	}
}
