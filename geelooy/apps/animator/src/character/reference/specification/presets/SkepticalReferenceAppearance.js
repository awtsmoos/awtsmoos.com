// B"H
// Boruch Hashem
// Blessed is He

/**
 * Gevurah narrows the jaw, lowers the lids, and gathers the beard toward one
 * guarded center. The Awtsmoos renews attention, while Awtsmoos.com keeps
 * Dovid's skepticism editable through gaze, brow, mouth, peyot, and kippah.
 */
export class SkepticalReferenceAppearance {
	static create() {
		return {
			faceStyle: {
				widthScale: 1.11,
				heightScale: 1.08,
				cheekScale: 1,
				jawScale: 0.79,
				chinScale: 0.55,
				lineWidth: 3.1
			},
			browStyle: {
				width: 19,
				thickness: 4.5,
				arch: -0.8,
				verticalOffset: 0.5
			},
			noseStyle: {
				sizeScale: 1.02,
				verticalOffset: 1,
				lineWidth: 2
			},
			eyeStyle: {
				widthScale: 1.4,
				heightScale: 1.12,
				spacingScale: 1.06,
				pupilScale: 0.9,
				outlineWidth: 2.15,
				lidWidth: 2.3,
				lidDrop: 0.3,
				verticalOffset: 0.8
			},
			mouthStyle: {
				widthScale: 0.94,
				heightScale: 0.76,
				smileBias: -0.3,
				lineWidth: 2.7,
				verticalOffset: 1.5,
				lowerLipWidth: 1
			},
			beardGeometry: {
				cheekScale: 0.68,
				topOffset: 6,
				mouthClearance: 11,
				lengthScale: 1.08,
				chinWidth: 17,
				taper: 0.58,
				bottomRoundness: 0.72,
				lineWidth: 2.5,
				strandOpacity: 0.08
			},
			payosGeometry: {
				rootOffsetX: 1,
				rootOffsetY: 0,
				amplitude: 12,
				secondAmplitude: 8,
				terminalCurl: 7,
				lengthScale: 0.88,
				lineWidth: 3.4
			},
			headwear: {
				type: 'kippah',
				size: 1,
				widthScale: 1.12,
				heightScale: 0.82,
				verticalOffset: -1,
				curvature: 0.56,
				tilt: 0.01,
				lineWidth: 2.4,
				highlightOpacity: 0.07
			},
			headTransform: {
				x: 0,
				y: -6,
				scaleX: 1.08,
				scaleY: 1.14
			}
		};
	}
}
