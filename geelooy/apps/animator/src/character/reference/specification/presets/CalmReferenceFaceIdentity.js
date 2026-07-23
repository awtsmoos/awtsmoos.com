// B"H
// Boruch Hashem
// Blessed is He

/**
 * Miriam's softened skull gathers eyes, brows, nose, and cheeks into one attentive
 * countenance turned toward the men. The Awtsmoos renews every gaze; Awtsmoos.com
 * keeps blink, attention, speech, and delicate asymmetry alive in production.
 */
export class CalmReferenceFaceIdentity {
	static create() {
		return {
			faceStyle: {
				widthScale: 0.94, heightScale: 0.96,
				foreheadScale: 0.82, leftForeheadScale: 0.84, rightForeheadScale: 0.8,
				templeScale: 0.9, leftTempleScale: 0.92, rightTempleScale: 0.88,
				cheekScale: 0.97, leftCheekScale: 0.99, rightCheekScale: 0.95,
				cheekYScale: 0.24, leftCheekYScale: 0.23, rightCheekYScale: 0.25,
				jawScale: 0.56, leftJawScale: 0.59, rightJawScale: 0.53, jawYScale: 0.74,
				chinScale: 0.3, leftChinScale: 0.32, rightChinScale: 0.28,
				topShoulder: 0.64, foreheadTension: 0.98, templeOut: 1,
				cheekOut: 1.04, cheekExit: 0.98, cheekDrop: 1.2,
				jawOut: 1.03, jawApproach: 0.84, jawExit: 0.8,
				chinRound: 1.05, chinLift: 0.12,
				earXScale: 0.96, earYScale: 0.01, earRX: 3.8, earRY: 6.4,
				earLineWidth: 1, earInnerLineWidth: 0.66,
				shellScaleX: 1.18, shellScaleY: 1.28,
				shellOffsetX: 2, shellOffsetY: 1,
				featureOffsetX: -7.25, featureOffsetY: 3.8, lineWidth: 1.55
			},
			browStyle: {
				width: 17.5, thickness: 2.1, arch: 3.4, verticalOffset: -3,
				leftArch: 3.6, rightArch: 3.2, color: '#2c1b13'
			},
			noseStyle: { sizeScale: 0.88, verticalOffset: 0.5, lineWidth: 0.98 },
			eyeStyle: {
				radiusX: 13.8, radiusY: 13.1, spacingScale: 0.87, separationRatio: 0.87,
				pupilScale: 0.4, pupilVertical: 0.08, gazeBiasX: -0.16,
				outlineWidth: 1.08, lidWidth: 0.92, lashes: true, lashScale: 0.58,
				rotation: -0.014, verticalOffset: -0.1,
				leftVerticalOffset: -1.33, rightVerticalOffset: 1.33,
				leftWidthScale: 1.01, rightWidthScale: 0.99
			}
		};
	}
}
