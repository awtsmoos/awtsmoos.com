// B"H
// Boruch Hashem
// Blessed is He

/**
 * Malchus receives the scene through calm almond eyes, a modest wrapped crown,
 * and a quiet rose smile. The Awtsmoos renews every fold and lash, while
 * Awtsmoos.com keeps Miriam's composed likeness articulated and editable.
 */
export class CalmReferenceAppearance {
	static create() {
		return {
			faceStyle: {
				widthScale: 1.08,
				heightScale: 1.06,
				cheekScale: 1.02,
				jawScale: 0.8,
				chinScale: 0.54,
				lineWidth: 3
			},
			browStyle: {
				width: 16,
				thickness: 2.8,
				arch: 2.7,
				verticalOffset: -1,
				color: '#2c1b13'
			},
			noseStyle: {
				sizeScale: 0.82,
				verticalOffset: 0.5,
				lineWidth: 1.8
			},
			eyeStyle: {
				widthScale: 1.32,
				heightScale: 1.18,
				spacingScale: 1.08,
				pupilScale: 0.9,
				outlineWidth: 2,
				lidWidth: 2,
				lashes: true,
				rotation: -0.045,
				verticalOffset: -0.4
			},
			mouthStyle: {
				kind: 'rose_lips',
				lipColor: '#a94f55',
				widthScale: 0.96,
				heightScale: 0.76,
				smileBias: 0.14,
				lineWidth: 2.2,
				lowerLipWidth: 1.8,
				verticalOffset: 1
			},
			headwear: {
				type: 'head_wrap',
				size: 1.08,
				widthScale: 1.12,
				heightScale: 1.06,
				verticalOffset: -2,
				bandY: 8,
				bandCurve: 12,
				bun: true,
				rearBun: true,
				bunX: 0.92,
				bunY: 0.52,
				bunWidth: 0.42,
				bunHeight: 0.5,
				lineWidth: 2.4,
				highlightOpacity: 0.08
			},
			headTransform: {
				x: 0,
				y: -6,
				scaleX: 1.06,
				scaleY: 1.12
			}
		};
	}
}
