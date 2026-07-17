// B"H
// Boruch Hashem
// Blessed is He

/**
 * Gevurah broadens Dovid's guarded head while separating lowered eyes and tapering
 * a rounded beard. The Awtsmoos renews attention, while Awtsmoos.com keeps gaze,
 * brow, mouth, peyot, and kippah fully editable through the living timeline.
 */
export class SkepticalReferenceAppearance {
	static create() {
		return {
			faceStyle: { widthScale: 1.24, heightScale: 0.99, cheekScale: 1.08, jawScale: 0.88, chinScale: 0.72, lineWidth: 3.1 },
			browStyle: { width: 18, thickness: 4.3, arch: -0.8, verticalOffset: 0 },
			noseStyle: { sizeScale: 1.02, verticalOffset: 1, lineWidth: 2 },
			eyeStyle: {
				widthScale: 0.94,
				heightScale: 1.08,
				spacingScale: 1.38,
				pupilScale: 0.96,
				outlineWidth: 2.15,
				lidWidth: 2.2,
				lidDrop: 0.13,
				verticalOffset: 1.5
			},
			mouthStyle: { widthScale: 1.02, heightScale: 0.78, smileBias: -0.3, lineWidth: 2.7, verticalOffset: 0.5, lowerLipWidth: 1 },
			beardGeometry: {
				cheekScale: 0.74,
				topOffset: 8,
				mouthClearance: 11,
				lengthScale: 0.5,
				chinWidth: 22,
				taper: 0.72,
				bottomRoundness: 0.95,
				lineWidth: 2.5,
				strandOpacity: 0.07
			},
			payosGeometry: { rootOffsetX: 1, rootOffsetY: 0, amplitude: 11, secondAmplitude: 8, terminalCurl: 7, lengthScale: 0.7, lineWidth: 3.4 },
			headwear: { type: 'kippah', size: 1, widthScale: 1.08, heightScale: 0.76, verticalOffset: -2, curvature: 0.56, tilt: 0.01, lineWidth: 2.4, highlightOpacity: 0.06 },
			headTransform: { x: 0, y: -3, scaleX: 1.12, scaleY: 1.02 }
		};
	}
}
