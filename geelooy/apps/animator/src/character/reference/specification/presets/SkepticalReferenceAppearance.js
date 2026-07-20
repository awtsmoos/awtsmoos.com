// B"H
// Boruch Hashem
// Blessed is He

/**
 * Gevurah shapes Dovid through hooded eyes, compression, and a guarded beard.
 * The Awtsmoos renews his sideward attention while Awtsmoos.com keeps every
 * control editable, keyframeable, serializable, and production-rendered.
 */
export class SkepticalReferenceAppearance {
	static create() {
		return {
			faceStyle: {
				widthScale: 1.06, heightScale: 1, foreheadScale: 0.88, templeScale: 0.96,
				cheekScale: 0.98, cheekYScale: 0.28, jawScale: 0.76, jawYScale: 0.74,
				chinScale: 0.46, earXScale: 0.97, earYScale: 0.01, earRX: 5,
				earRY: 8.4, shellScaleX: 1.28, shellScaleY: 1.48,
				shellOffsetX: 15, shellOffsetY: 10,
				featureOffsetX: -3, featureOffsetY: 36, lineWidth: 2.2
			},
			browStyle: { width: 20, thickness: 3.7, arch: -1.2, verticalOffset: -0.5 },
			noseStyle: { sizeScale: 1.12, verticalOffset: 1, lineWidth: 1.7 },
			eyeStyle: {
				kind: 'skeptical', radiusX: 12.2, radiusY: 12.2,
				spacingScale: 0.98, separationRatio: 0.84, pupilScale: 0.7,
				pupilVertical: 0.12, outlineWidth: 1.65, lidWidth: 2,
				lidDrop: 0.14, verticalOffset: 1.2, maxAspect: 0.95
			},
			mouthStyle: {
				widthScale: 1.32, heightScale: 0.76, smileBias: -0.62,
				verticalOffset: -0.6, lineWidth: 2.1, lowerLipWidth: 1
			},
			beardGeometry: {
				massStyle: 'continuous', cheekScale: 0.78, topOffset: 7,
				mouthVerticalOffset: -4, mouthClearance: 10, openingHeight: 7,
				moustacheHalf: 9.5, moustacheWidth: 3, lengthScale: 0.75,
				chinWidth: 24, taper: 0.66, bottomRoundness: 0.9,
				lineWidth: 2.05, strandOpacity: 0.05
			},
			payosGeometry: {
				rootScaleX: 0.9, rootOffsetX: -1, rootOffsetY: 1,
				amplitude: 5.5, secondAmplitude: 3.5, terminalCurl: 4.5,
				lengthScale: 0.56, lineWidth: 2.6
			},
			headwear: {
				type: 'kippah', size: 1, widthScale: 1.05, heightScale: 0.98,
				verticalOffset: 5, curvature: 0.95, tilt: 0.01,
				lineWidth: 1.9, highlightOpacity: 0.03
			},
			headTransform: { x: 0, y: -3, scaleX: 1.08, scaleY: 1.02 }
		};
	}
}
