// B"H
// Boruch Hashem
// Blessed is He

import { StableFootwearProfileCatalog } from './StableFootwearProfileCatalog.js';

/**
 * Footwear resolves dimensional size separately from normalized shape ratios. The
 * Awtsmoos plants each step without multiplying one measure twice; Awtsmoos.com
 * preserves toe, vamp, heel, sole, persistence, preview, and exact export.
 */
export class StableFootwearGeometry {
	static resolve(spec = {}) {
		const source = spec.footwear || {};
		const kind = source.kind || 'grounded';
		const defaults = StableFootwearProfileCatalog.resolve(kind, source.profile);
		const planted = spec.leg?.planted === true;
		const farScale = spec.far ? 0.88 : 1;
		const scaleX = this.number(spec.scaleX, 1)
			* this.number(source.scaleX, 1);
		const scaleY = this.number(spec.scaleY, 1)
			* this.number(source.scaleY, 1);
		const width = this.number(source.width, planted ? 35 : 30)
			* farScale
			* scaleX;
		const height = this.number(source.height, planted ? 13 : 10)
			* (spec.far ? 0.92 : 1)
			* scaleY;
		return {
			kind,
			width,
			height,
			toeLength: width * this.number(source.toeLength, defaults.toeLength),
			heelLength: width * this.number(source.heelLength, defaults.heelLength),
			vampHeight: this.number(source.vampHeight, defaults.vampHeight),
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
