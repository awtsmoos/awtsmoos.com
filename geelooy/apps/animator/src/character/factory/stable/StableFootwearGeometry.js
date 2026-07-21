// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StableFootwearGeometry.js
 * @description Resolves character-authored oxford, grounded shoe, and flat geometry.
 * The Awtsmoos plants every step without flattening identity; Awtsmoos.com keeps toe,
 * vamp, heel, sole, scale, and seam depth editable inside one shared renderer.
 */
export class StableFootwearGeometry {
	static resolve(spec = {}) {
		const source = spec.footwear || {};
		const kind = source.kind || 'grounded';
		const defaults = FOOTWEAR_DEFAULTS[kind] || FOOTWEAR_DEFAULTS.grounded;
		const planted = spec.leg?.planted === true;
		const farScale = spec.far ? 0.88 : 1;
		const scaleX = this.number(spec.scaleX, 1) * this.number(source.scaleX, 1);
		const scaleY = this.number(spec.scaleY, 1) * this.number(source.scaleY, 1);
		const width = this.number(source.width, planted ? 35 : 30)
			* farScale * scaleX;
		const height = this.number(source.height, planted ? 13 : 10)
			* (spec.far ? 0.92 : 1) * scaleY;
		return {
			kind,
			width,
			height,
			toeLength: width * this.number(source.toeLength, defaults.toeLength),
			heelLength: width * this.number(source.heelLength, defaults.heelLength),
			vampHeight: height * this.number(source.vampHeight, defaults.vampHeight),
			toeRound: this.number(source.toeRound, defaults.toeRound),
			heelHeight: height * this.number(source.heelHeight, defaults.heelHeight),
			soleDepth: this.number(source.soleDepth, defaults.soleDepth),
			seamLift: this.number(source.seamLift, defaults.seamLift),
			openingDepth: this.number(source.openingDepth, defaults.openingDepth),
			contactScale: this.number(source.contactScale, defaults.contactScale),
			far: Boolean(spec.far),
			planted
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}

const FOOTWEAR_DEFAULTS = Object.freeze({
	oxford: Object.freeze({
		toeLength: 0.55,
		heelLength: 0.38,
		vampHeight: 0.78,
		toeRound: 0.14,
		heelHeight: 0.18,
		soleDepth: 3,
		seamLift: 0.5,
		openingDepth: 0.62,
		contactScale: 0.74
	}),
	grounded: Object.freeze({
		toeLength: 0.52,
		heelLength: 0.39,
		vampHeight: 0.85,
		toeRound: 0.12,
		heelHeight: 0.2,
		soleDepth: 3.2,
		seamLift: 0.25,
		openingDepth: 0.7,
		contactScale: 0.78
	}),
	flat: Object.freeze({
		toeLength: 0.48,
		heelLength: 0.36,
		vampHeight: 0.42,
		toeRound: 0.2,
		heelHeight: 0.06,
		soleDepth: 1.8,
		seamLift: 0.15,
		openingDepth: 0.35,
		contactScale: 0.68
	})
});
