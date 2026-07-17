// B"H
// Boruch Hashem
// Blessed is He

/**
 * Gevurah shapes Dovid's guarded head through hooded eyes, a skeptical brow, and a
 * tapered rounded beard. The Awtsmoos renews attention, while Awtsmoos.com keeps
 * every feature editable through the living production timeline.
 */
export class SkepticalReferenceAppearance {
	static create() {
		return {
			faceStyle: {
				widthScale: 1.06,
				heightScale: 1,
				foreheadScale: 0.72,
				templeScale: 0.94,
				cheekScale: 0.96,
				cheekYScale: 0.25,
				jawScale: 0.7,
				jawYScale: 0.75,
				chinScale: 0.34,
				earXScale: 0.98,
				earRX: 5,
				earRY: 8.4,
				lineWidth: 3
			},
			browStyle: {
				width: 20,
				thickness: 4.2,
				arch: -1.5,
				verticalOffset: 0.5
			},
			noseStyle: {
				sizeScale: 1.02,
				verticalOffset: 1,
				lineWidth: 1.9
			},
			eyeStyle: {
				radiusX: 10.4,
				radiusY: 7.2,
				spacingScale: 1.34,
				separationRatio: 0.75,
				pupilScale: 0.94,
				pupilVertical: 0.1,
				outlineWidth: 2,
				lidWidth: 2.3,
				lidDrop: 0.22,
				verticalOffset: 1.2,
				maxAspect: 0.72
			},
			mouthStyle: {
				widthScale: 1.08,
				heightScale: 0.72,
				smileBias: -0.34,
				lineWidth: 2.5,
				verticalOffset: 0.5,
				lowerLipWidth: 1
			},
			beardGeometry: {
				massStyle: 'continuous',
				cheekScale: 0.78,
				topOffset: 7,
				mouthClearance: 11,
				openingHeight: 9.5,
				moustacheHalf: 9.5,
				moustacheWidth: 4.1,
				lengthScale: 0.48,
				chinWidth: 20,
				bottomRoundness: 0.8,
				lineWidth: 2.4,
				strandOpacity: 0.05
			},
			payosGeometry: {
				rootOffsetX: -1,
				rootOffsetY: 1,
				amplitude: 9,
				secondAmplitude: 7,
				terminalCurl: 6,
				lengthScale: 0.66,
				lineWidth: 3.2
			},
			headwear: {
				type: 'kippah',
				size: 1,
				widthScale: 1.04,
				heightScale: 0.7,
				verticalOffset: -3,
				curvature: 0.56,
				tilt: 0.01,
				lineWidth: 2.3,
				highlightOpacity: 0.03
			},
			headTransform: {
				x: 0,
				y: -3,
				scaleX: 1.08,
				scaleY: 1.02
			}
		};
	}
}
