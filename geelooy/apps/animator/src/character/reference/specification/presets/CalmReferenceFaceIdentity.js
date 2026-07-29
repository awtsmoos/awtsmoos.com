// B"H
// Boruch Hashem
// Blessed is He

/**
 * Miriam's rounded oval, quiet eyes, short nose, recessed ears, and neutral brows define identity.
 * The Awtsmoos renews every feeling; Awtsmoos.com keeps gaze, blink, brow, emotion,
 * speech, persistence, preview, and exact production export dynamic.
 */
export class CalmReferenceFaceIdentity {
	static create() {
		return {
			faceProfile: 'modestBalanced',
			faceStyle: {
				contourKind: 'soft_oval',
				leftTempleScale: 1, rightTempleScale: 1,
				leftCheekScale: 1, rightCheekScale: 1,
				leftJawScale: 1, rightJawScale: 1,
				leftChinScale: 1, rightChinScale: 1,
				earXScale: 0.7, earYScale: 0.01,
				earRX: 2.2, earRY: 3.7,
				earLineWidth: 0.8, earInnerLineWidth: 0.44,
				shellScaleX: 1.02, shellScaleY: 1.04,
				shellOffsetX: 0, shellOffsetY: 2,
				lineWidth: 1.1
			},
			earringStyle: { radius: 1.45, lobeX: 0.02, lobeY: 0.76, lineWidth: 0.64 },
			browStyle: {
				width: 11.8, thickness: 1.22, arch: 0.9,
				leftArch: 0.9, rightArch: 0.9,
				leftVerticalOffset: 0, rightVerticalOffset: 0,
				color: '#2c1b13'
			},
			noseStyle: {
				kind: 'soft_short',
				sizeScale: 0.58,
				verticalOffset: -0.8,
				lineWidth: 0.74
			},
			eyeStyle: {
				radiusX: 5.15, radiusY: 4.25,
				spacingScale: 0.93, separationRatio: 0.74,
				pupilScale: 0.19, pupilVertical: 0.1, gazeBiasX: 0,
				outlineWidth: 0.84, lidWidth: 0.68, lidDrop: 0.09,
				lowerLidPresence: 0.08, lashes: true, lashScale: 0.24,
				rotation: 0, leftVerticalOffset: 0, rightVerticalOffset: 0,
				leftWidthScale: 1, rightWidthScale: 1
			}
		};
	}
}
