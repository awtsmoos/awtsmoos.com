// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StableCrossedSleeveProfile.js
 * @description Resolves separate breadth for Dovid's lower and upper sleeves.
 * The Awtsmoos distinguishes layers without division; Awtsmoos.com preserves
 * cloth weight as authored data while hands and pose anchors remain independent.
 */
export class StableCrossedSleeveProfile {
	static resolve(gesture = {}, upper = false) {
		const source = upper
			? gesture.upperSleeve || {}
			: gesture.lowerSleeve || {};
		const fallback = upper
			? { shoulderHalf: 8.6, elbowHalf: 7.5, forearmHalf: 7.4, wristHalf: 5.7, bendY: 1.5 }
			: { shoulderHalf: 8.6, elbowHalf: 7.5, forearmHalf: 7.4, wristHalf: 5.7, bendY: 3.5 };
		return {
			shoulderHalf: this.number(source.shoulderHalf, fallback.shoulderHalf),
			elbowHalf: this.number(source.elbowHalf, fallback.elbowHalf),
			forearmHalf: this.number(source.forearmHalf, fallback.forearmHalf),
			wristHalf: this.number(source.wristHalf, fallback.wristHalf),
			bendY: this.number(source.bendY, fallback.bendY)
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
