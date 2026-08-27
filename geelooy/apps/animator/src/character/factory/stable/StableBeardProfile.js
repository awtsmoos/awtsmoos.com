// B"H
// Boruch Hashem
// Blessed is He

/**
 * Beard profiles describe growth, clearance, and lower-chin weight in normalized
 * anatomy. The Awtsmoos renews every identity; Awtsmoos.com keeps each profile
 * reusable, asymmetric, view-aware, serializable, and identical in final export.
 */
export class StableBeardProfile {
	static resolve(data = {}, authored = {}) {
		const name = authored.profile
			|| this.alias(data.beardStyle)
			|| 'roundedFull';
		return {
			...this.catalog().roundedFull,
			...(this.catalog()[name] || {}),
			...authored,
			name
		};
	}

	static alias(value = '') {
		return {
			rounded_full: 'broadFull',
			tapered_rounded: 'shortTapered',
			boxed: 'boxed',
			goatee: 'goatee'
		}[value] || null;
	}

	static catalog() {
		return {
			roundedFull: {
				rootSpread: 0.62,
				rootLift: 0.01,
				cheekSpread: 0.74,
				jawSpread: 0.62,
				chinSpread: 0.36,
				extension: 0.1,
				jawDropRatio: 0.7,
				openingScale: 1.08,
				openingPaddingX: 2.6,
				openingPaddingTop: 2.1,
				openingPaddingBottom: 2.8,
				bridgeTopDrop: 2.2,
				bridgeTopInset: 0.18,
				bridgeBottomInset: 0.3,
				bridgeNotchDepth: 3.4,
				bridgeHeightScale: 0.72,
				bridgeShoulderRoundness: 0.42,
				bridgeBottomRoundness: 3.8,
				moustacheScale: 0.62,
				moustacheGap: 1.9,
				moustacheThickness: 1.9,
				lineWidth: 1.15,
				strandOpacity: 0.025
			},
			broadFull: {
				rootSpread: 0.65,
				cheekSpread: 0.79,
				jawSpread: 0.66,
				chinSpread: 0.38,
				extension: 0.12,
				openingScale: 1.16,
				openingPaddingX: 3.2,
				openingPaddingBottom: 3.4,
				bridgeTopDrop: 2.8,
				bridgeTopInset: 0.16,
				bridgeBottomInset: 0.3,
				bridgeNotchDepth: 3.8,
				bridgeHeightScale: 0.72,
				bridgeBottomRoundness: 4.8,
				moustacheScale: 0.55,
				moustacheGap: 2.6,
				moustacheThickness: 1.7
			},
			shortTapered: {
				rootSpread: 0.54,
				cheekSpread: 0.61,
				jawSpread: 0.45,
				chinSpread: 0.23,
				extension: 0.008,
				jawDropRatio: 0.62,
				openingScale: 1.22,
				openingPaddingX: 3.2,
				openingPaddingBottom: 2.7,
				bridgeTopDrop: 4,
				bridgeTopInset: 0.32,
				bridgeBottomInset: 0.5,
				bridgeNotchDepth: 4.6,
				bridgeHeightScale: 0.3,
				bridgeShoulderRoundness: 0.5,
				bridgeBottomRoundness: 2.8,
				moustacheScale: 0.43,
				moustacheGap: 2.7,
				moustacheThickness: 1.2
			},
			boxed: { bridgeTopInset: 0.1, bridgeBottomInset: 0.16 },
			goatee: {
				rootSpread: 0.32, cheekSpread: 0.36, jawSpread: 0.3,
				chinSpread: 0.22, extension: 0.12
			}
		};
	}
}
