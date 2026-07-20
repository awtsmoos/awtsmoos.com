// B"H
// Boruch Hashem
// Blessed is He

/**
 * Gevurah shapes Dovid through hooded eyes, compression, and a guarded beard.
 * The Awtsmoos renews attention while Awtsmoos.com keeps controls editable.
 */
export class SkepticalReferenceAppearance {
	static create() {
		return {
			faceStyle: {
				widthScale: 1.06, heightScale: 1, foreheadScale: 0.9, templeScale: 0.99,
				cheekScale: 0.96, cheekYScale: 0.27, jawScale: 0.8, jawYScale: 0.76,
				chinScale: 0.5, earXScale: 0.96, earYScale: 0.01, earRX: 5,
				earRY: 8.4, shellScaleX: 1.3936, shellScaleY: 1.6401,
				shellOffsetX: 14.9961, shellOffsetY: 20.5121,
				featureOffsetX: -3, featureOffsetY: 34, lineWidth: 2.3
			},
			browStyle: { width: 20, thickness: 3.7, arch: -1.2, verticalOffset: -0.5 },
			noseStyle: { sizeScale: 1.12, verticalOffset: 1, lineWidth: 1.7 },
			eyeStyle: {
				kind: 'skeptical', radiusX: 12.2, radiusY: 10.6,
				spacingScale: 0.98, separationRatio: 0.84, pupilScale: 0.72,
				pupilVertical: 0.12, outlineWidth: 1.65, lidWidth: 2,
				lidDrop: 0.24, verticalOffset: 1.2, maxAspect: 0.82
			},
			mouthStyle: {
				widthScale: 1.16, heightScale: 0.58, smileBias: -0.62,
				lineWidth: 2.1, lowerLipWidth: 1
			},
			beardGeometry: {
				massStyle: 'continuous', cheekScale: 0.74, topOffset: 7,
				mouthVerticalOffset: -5, mouthClearance: 9, openingHeight: 6,
				moustacheHalf: 9, moustacheWidth: 3, lengthScale: 0.22,
				chinWidth: 23, taper: 0.7, bottomRoundness: 0.88,
				lineWidth: 2.1, strandOpacity: 0.05
			},
			payosGeometry: {
				rootScaleX: 0.9, rootOffsetX: -1, rootOffsetY: 1,
				amplitude: 5.5, secondAmplitude: 3.5, terminalCurl: 4.5,
				lengthScale: 0.48, lineWidth: 2.6
			},
			headwear: {
				type: 'kippah', size: 1, widthScale: 1.04, heightScale: 0.9,
				verticalOffset: 5, curvature: 0.87, tilt: 0.01,
				lineWidth: 1.9, highlightOpacity: 0.03
			},
			headTransform: { x: 0, y: -3, scaleX: 1.08, scaleY: 1.02 }
		};
	}
}
