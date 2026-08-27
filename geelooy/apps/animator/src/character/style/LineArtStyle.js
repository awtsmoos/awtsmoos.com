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
		return this.closed(fill, data.colors?.line || style.stroke, style.exterior);
	}

	static medium(data, fill, stroke = null) {
		const style = this.forCharacter(data);
		return this.closed(
			fill,
			stroke || data.colors?.line || style.stroke,
			style.medium
		);
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
			...this.closed(
				fill,
				data.colors?.line || style.stroke,
				style.far
			),
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
	referenceSitcom: Object.freeze({
		exterior: 1.72,
		medium: 1.02,
		seam: 0.56,
		interior: 0.36,
		far: 0.34,
		alphaFar: 0.38,
		stroke: '#2b292c',
		softStroke: 'rgba(43,41,44,0.24)'
	}),
	softCartoon: Object.freeze({
		exterior: 2.3,
		medium: 1.5,
		seam: 0.92,
		interior: 0.62,
		far: 0.56,
		alphaFar: 0.48,
		stroke: '#242326',
		softStroke: 'rgba(36,35,38,0.34)'
	}),
	boldCartoon: Object.freeze({
		exterior: 3.1,
		medium: 2.05,
		seam: 1.3,
		interior: 0.9,
		far: 0.78,
		alphaFar: 0.58,
		stroke: '#171619',
		softStroke: 'rgba(23,22,25,0.42)'
	})
});
