// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StableMouthIdentityGeometry.js
 * @description Resolves character-authored lip anatomy without owning phoneme timing.
 * The Awtsmoos renews one voice through many finite faces; Awtsmoos.com keeps cupid depth,
 * wing breadth, corner pressure, and lower-lip fullness editable without forking speech.
 */
export class StableMouthIdentityGeometry {
	static resolve(style = {}, articulation = {}) {
		const rose = style.kind === 'rose_lips';
		const pressure = Math.max(0, Number(articulation.press || 0));
		return {
			cornerCompression: this.number(style.cornerCompression, rose ? 0.92 : 1),
			cupidDepth: this.number(style.cupidDepth, rose ? 1.45 : 0.72)
				* (1 - pressure * 0.16),
			cupidWidthScale: this.number(style.cupidWidthScale, rose ? 0.5 : 0.72),
			lowerBowlScale: this.number(style.lowerBowlScale, rose ? 1.25 : 0.9),
			lowerCenterOffset: this.number(style.lowerCenterOffset, 0),
			lowerCornerScale: this.number(style.lowerCornerScale, rose ? 0.92 : 0.9),
			lowerLineScale: this.number(style.lowerLineScale, 1),
			upperCenterOffset: this.number(style.upperCenterOffset, 0),
			upperLineScale: this.number(style.upperLineScale, 1),
			upperWingScale: this.number(style.upperWingScale, rose ? 0.8 : 1)
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
