// B"H
// Boruch Hashem
// Blessed is He

/**
 * Gevurah shapes Dovid through hooded sideways eyes, an asymmetric brow, and a
 * tapered rounded beard. The Awtsmoos renews attention, while Awtsmoos.com keeps
 * every guarded feature editable through the living production timeline.
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
				arch: -2.2,
				verticalOffset: 0.5
			},
			noseStyle: {
				sizeScale: 1.02,
				verticalOffset: 1,
				lineWidth: 1.9
			},
			eyeStyle: {
				kind: 'skeptical',
				radiusX: 11.6,
				radiusY: 7.4,
				spacingScale: 1.3,
				separationRatio: 0.8,
				pupilScale: 0.94,
				pupilVertical: 0.22,
				outlineWidth: 2,
				lidWidth: 2.5,
				lidDrop: 0.32,
				verticalOffset: 1.2,
				maxAspect: 0.7
			},
			mouthStyle: {
				widthScale: 1.22,
				heightScale: 0.76,
				smileBias: -0.42,
				lineWidth: 2.6,
				verticalOffset: 0,
				lowerLipWidth: 1
			},
			beardGeometry: {
				massStyle: 'continuous',
				cheekScale: 0.78,
				topOffset: 7,
				mouthVerticalOffset: -5,
				mouthClearance: 12,
				openingHeight: 10,
				moustacheHalf: 9.5,
				moustacheWidth: 4,
				lengthScale: 0.22,
				chinWidth: 21,
				taper: 0.62,
				bottomRoundness: 0.82,
				lineWidth: 2.4,
				strandOpacity: 0.05
			},
			payosGeometry: {
				rootScaleX: 0.89,
				rootOffsetX: -1,
				rootOffsetY: 1,
				amplitude: 6,
				secondAmplitude: 4,
				terminalCurl: 5,
				lengthScale: 0.58,
				lineWidth: 3
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
