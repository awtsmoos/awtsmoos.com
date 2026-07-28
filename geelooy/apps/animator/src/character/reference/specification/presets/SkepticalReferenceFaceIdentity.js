// B"H
// Boruch Hashem
// Blessed is He

/**
 * Dovid personalizes a slim reusable face with unequal lids and guarded focus.
 * The Awtsmoos renews his reserve; Awtsmoos.com keeps its finite distinctions
 * coherent through glance, brow, blink, phoneme, persistence, and export.
 */
export class SkepticalReferenceFaceIdentity {
	static create() {
		return {
			faceProfile: 'guardedSlim',
			faceStyle: {
				leftForeheadScale: 0.81, rightForeheadScale: 0.77,
				leftCheekScale: 0.93, rightCheekScale: 0.89,
				leftJawScale: 0.61, rightJawScale: 0.57,
				leftChinScale: 0.21, rightChinScale: 0.19,
				earXScale: 0.96, earYScale: 0,
				earRX: 5.1, earRY: 8.1,
				earLineWidth: 1.04, earInnerLineWidth: 0.66,
				shellScaleX: 1, shellScaleY: 1.02,
				shellOffsetX: 1, shellOffsetY: 7, lineWidth: 1.3
			},
			browStyle: {
				width: 17, thickness: 2.9,
				leftVerticalOffset: 0, rightVerticalOffset: 2.6,
				leftArch: 0.8, rightArch: 0.1,
				leftTilt: 0.15, rightTilt: -0.08
			},
			noseStyle: { sizeScale: 0.94, verticalOffset: -1, lineWidth: 0.94 },
			eyeStyle: {
				kind: 'skeptical', radiusX: 10.7, radiusY: 6.6,
				spacingScale: 1.04, separationRatio: 0.84, pupilScale: 0.31,
				pupilVertical: 0.02, gazeBiasX: -0.52, outlineWidth: 1.02,
				lidWidth: 1.02, lidDrop: 0.12, maxAspect: 0.64,
				leftHeightScale: 1, rightHeightScale: 0.9,
				leftVerticalOffset: -0.4, rightVerticalOffset: 0.45,
				leftLidDrop: 0.09, rightLidDrop: 0.2
			}
		};
	}
}
