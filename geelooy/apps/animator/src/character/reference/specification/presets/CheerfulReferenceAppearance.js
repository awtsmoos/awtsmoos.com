// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chesed rounds Ari's crown, cheeks, laugh, beard, and welcoming gaze. The
 * Awtsmoos renews each curve while Awtsmoos.com keeps every control editable,
 * keyframeable, serializable, and identical in preview and export.
 */
export class CheerfulReferenceAppearance {
	static create() {
		return {
			faceStyle: {
				widthScale: 1.15, heightScale: 1, foreheadScale: 0.9, templeScale: 0.98,
				cheekScale: 1.02, cheekYScale: 0.3, jawScale: 0.86, jawYScale: 0.74,
				chinScale: 0.56, earXScale: 0.97, earYScale: -0.01, earRX: 5.2,
				earRY: 8.7, shellScaleX: 1.16, shellScaleY: 1.52,
				shellOffsetX: -15.8, shellOffsetY: 20,
				featureOffsetX: -2.8, featureOffsetY: 34, lineWidth: 2.25
			},
			browStyle: { width: 19, thickness: 3.6, arch: 4.8, verticalOffset: -3 },
			noseStyle: { sizeScale: 1.08, verticalOffset: 0.5, lineWidth: 1.7 },
			eyeStyle: {
				radiusX: 11.8, radiusY: 12.4, spacingScale: 1.14,
				separationRatio: 0.79, pupilScale: 0.66, pupilVertical: 0.28,
				outlineWidth: 1.65, lidWidth: 1.35, verticalOffset: 1
			},
			mouthStyle: {
				widthScale: 1.58, heightScale: 1.55, smileBias: 0.68,
				minimumOpen: 0.82, minimumJaw: 0.72, minimumTeeth: 0.86,
				minimumTongue: 0.38, lineWidth: 2.1,
				horizontalOffset: -3.6, verticalOffset: 10.2
			},
			beardGeometry: {
				massStyle: 'continuous', cheekScale: 0.72, topOffset: 6,
				mouthVerticalOffset: 6.2, mouthClearance: 13, openingHeight: 10.5,
				moustacheHalf: 11, moustacheWidth: 3.2, lengthScale: 0.8,
				chinWidth: 25, taper: 0.95, bottomRoundness: 1.18,
				lineWidth: 2.05, strandOpacity: 0.06
			},
			payosGeometry: {
				rootScaleX: 0.9, rootOffsetX: -1, amplitude: 7,
				secondAmplitude: 4.5, terminalCurl: 5.5,
				lengthScale: 0.72, lineWidth: 2.8
			},
			headwear: {
				type: 'kippah', size: 1.02, widthScale: 1.08, heightScale: 0.96,
				verticalOffset: 5, curvature: 0.96, tilt: -0.035,
				lineWidth: 1.9, highlightOpacity: 0.04
			},
			headTransform: { x: -1, y: -2, scaleX: 1.08, scaleY: 1.02 }
		};
	}
}
