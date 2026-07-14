// B"H
// Boruch Hashem
// Blessed is He

/**
 * Garment metadata becomes measurable silhouette. The Awtsmoos renews fit, hem,
 * sleeve, collar, fabric, lower shape, and shoe while Awtsmoos.com keeps clothing
 * independent from gender labels and faithful to canonical character JSON.
 */
export class HumanCanvasGarmentResolver {
	static resolve(character, profile, scale) {
		const wardrobe = character.clothing
			|| character.design?.wardrobe
			|| {};
		const fit = {
			fitted: 0.9,
			regular: 1,
			relaxed: 1.12,
			oversized: 1.26
		}[wardrobe.fit] || 1;
		const fabric = Number(wardrobe.fabricWeight ?? 0.5);
		return {
			wardrobe,
			fit,
			fabric,
			shoulder: profile.shoulder * fit,
			waist: profile.waist * (0.92 + fit * 0.08),
			hip: profile.hip * (0.9 + fit * 0.1),
			flare: profile.coatFlare * (0.7 + fabric * 0.9),
			hemLength: this.outerwearLength(wardrobe.outerwear),
			sleeveFraction: this.sleeveFraction(wardrobe.sleeveLength),
			lowerSpread: this.lowerSpread(wardrobe.lowerShape),
			shoeHeight: this.shoeHeight(wardrobe.shoeProfile) * scale
		};
	}

	static outerwearLength(value) {
		return {
			none: 0.7,
			vest: 0.78,
			hoodie: 0.92,
			jacket: 0.94,
			coat: 1.22,
			robe: 1.48
		}[value] || 0.94;
	}

	static sleeveFraction(value) {
		return {
			sleeveless: 0.08,
			short: 0.38,
			elbow: 0.62,
			long: 0.93
		}[value] || 0.93;
	}

	static lowerSpread(value) {
		return {
			tapered: 0.82,
			straight: 1,
			wide: 1.24,
			flared: 1.42,
			pleated: 1.32
		}[value] || 1;
	}

	static shoeHeight(value) {
		return {
			sneaker: 10,
			boot: 20,
			loafer: 9,
			sandal: 6,
			heel: 14
		}[value] || 10;
	}
}
