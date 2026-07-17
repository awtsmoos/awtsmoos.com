// B"H
// Boruch Hashem
// Blessed is He

/**
 * Malchus receives the scene through separated almond eyes, a modest crown, a
 * small rear bun, and a quiet rose smile. The Awtsmoos renews every fold and lash,
 * while Awtsmoos.com keeps Miriam's composed likeness articulated and editable.
 */
export class CalmReferenceAppearance {
	static create() {
		return {
			faceStyle: { widthScale: 1.18, heightScale: 1, cheekScale: 1.08, jawScale: 0.88, chinScale: 0.7, lineWidth: 3 },
			browStyle: { width: 16, thickness: 2.9, arch: 2.8, verticalOffset: -1, color: '#2c1b13' },
			noseStyle: { sizeScale: 0.84, verticalOffset: 0.5, lineWidth: 1.8 },
			eyeStyle: {
				widthScale: 0.98,
				heightScale: 1.16,
				spacingScale: 1.36,
				pupilScale: 0.96,
				outlineWidth: 2,
				lidWidth: 2,
				lashes: true,
				rotation: -0.045,
				verticalOffset: 1
			},
			mouthStyle: { kind: 'rose_lips', lipColor: '#a94f55', widthScale: 1.02, heightScale: 0.78, smileBias: 0.16, lineWidth: 2.2, lowerLipWidth: 1.8, verticalOffset: 0.5 },
			headwear: {
				type: 'head_wrap',
				size: 0.98,
				widthScale: 1.03,
				heightScale: 0.72,
				verticalOffset: -4,
				bandCurve: 4,
				bun: true,
				bunX: 0.84,
				bunY: 0.22,
				bunWidth: 0.3,
				bunHeight: 0.34,
				lineWidth: 2.4,
				highlightOpacity: 0.08
			},
			headTransform: { x: 0, y: -3, scaleX: 1.08, scaleY: 1.02 }
		};
	}
}
