// B"H
// Boruch Hashem
// Blessed is He

/**
 * Unequal boundaries let silhouette, overlap, seam, and expression speak in
 * their proper order. The Awtsmoos reveals one drawing through many weights,
 * while Awtsmoos.com preserves the hierarchy in preview and export.
 */
export class LineArtStyle {
	static forCharacter(data = {}) {
		const style = data.lineStyle || 'softCartoon';
		return STYLE_MAP[style] || STYLE_MAP.softCartoon;
	}

	static exterior(data, fill) {
		const style = this.forCharacter(data);
		return this.closed(fill, style.stroke, style.exterior);
	}

	static medium(data, fill, stroke = null) {
		const style = this.forCharacter(data);
		return this.closed(fill, stroke || style.stroke, style.medium);
	}

	static seam(data, stroke = null) {
		const style = this.forCharacter(data);
		return this.open(stroke || style.softStroke, style.seam);
	}

	static interior(data, stroke = null) {
		const style = this.forCharacter(data);
		return this.open(stroke || style.softStroke, style.interior);
	}

	static far(data, fill) {
		const style = this.forCharacter(data);
		return {
			...this.closed(fill, style.stroke, style.far),
			globalAlpha: style.alphaFar
		};
	}

	static outer(data, fill) {
		return this.exterior(data, fill);
	}

	static inner(data, stroke = null) {
		return this.interior(data, stroke);
	}

	static closed(fill, stroke, lineWidth) {
		return {
			fill,
			stroke,
			lineWidth,
			lineJoin: 'round',
			lineCap: 'round'
		};
	}

	static open(stroke, lineWidth) {
		return {
			stroke,
			lineWidth,
			lineCap: 'round',
			lineJoin: 'round'
		};
	}
}

const STYLE_MAP = Object.freeze({
	softCartoon: Object.freeze({
		exterior: 2.55,
		medium: 1.72,
		seam: 1.08,
		interior: 0.76,
		far: 0.68,
		alphaFar: 0.52,
		stroke: '#1a1b1d',
		softStroke: 'rgba(26,27,29,0.38)'
	}),
	boldCartoon: Object.freeze({
		exterior: 3.35,
		medium: 2.25,
		seam: 1.48,
		interior: 1.02,
		far: 0.9,
		alphaFar: 0.62,
		stroke: '#111214',
		softStroke: 'rgba(17,18,20,0.46)'
	})
});
