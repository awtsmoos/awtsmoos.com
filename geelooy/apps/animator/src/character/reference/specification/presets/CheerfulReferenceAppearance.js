// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chesed rounds Ari's cheeks, separates large friendly eyes, and gathers a broad
 * beard beneath a living smile. The Awtsmoos renews each curve, while
 * Awtsmoos.com keeps likeness editable through production geometry and motion.
 */
export class CheerfulReferenceAppearance {
	static create() {
		return {
			faceStyle: { widthScale: 1.28, heightScale: 0.98, cheekScale: 1.18, jawScale: 0.96, chinScale: 0.8, lineWidth: 3.1 },
			browStyle: { width: 18, thickness: 4.2, arch: 1.8, verticalOffset: -1 },
			noseStyle: { sizeScale: 1.08, verticalOffset: 0.5, lineWidth: 2 },
			eyeStyle: {
				widthScale: 1.02,
				heightScale: 1.22,
				spacingScale: 1.42,
				pupilScale: 1.04,
				outlineWidth: 2.2,
				lidWidth: 1.8,
				verticalOffset: 1.5
			},
			mouthStyle: { widthScale: 1.34, heightScale: 1.2, smileBias: 0.34, minimumOpen: 0.52, teeth: 0.86, tongue: true, lineWidth: 2.7, verticalOffset: 0 },
			beardGeometry: {
				cheekScale: 0.84,
				topOffset: 8,
				mouthClearance: 13,
				lengthScale: 0.48,
				chinWidth: 28,
				taper: 1.02,
				bottomRoundness: 1.35,
				lineWidth: 2.6,
				strandOpacity: 0.08
			},
			payosGeometry: { rootOffsetX: 2, rootOffsetY: -1, amplitude: 15, secondAmplitude: 11, terminalCurl: 9, lengthScale: 0.82, lineWidth: 3.8 },
			headwear: { type: 'kippah', size: 1.03, widthScale: 1.1, heightScale: 0.78, verticalOffset: -2, curvature: 0.62, tilt: -0.035, lineWidth: 2.4, highlightOpacity: 0.08 },
			headTransform: { x: -1, y: -2, scaleX: 1.12, scaleY: 1.02 }
		};
	}
}
