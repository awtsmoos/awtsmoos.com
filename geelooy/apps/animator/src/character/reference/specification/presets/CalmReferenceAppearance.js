// B"H
// Boruch Hashem
// Blessed is He

/**
 * Malchus receives the scene through a soft face, leftward lashed gaze, brown
 * fringe, layered wrap, compact bun, gold earring, and rose lips. The Awtsmoos
 * renews her beauty while Awtsmoos.com keeps every control editable and durable.
 */
export class CalmReferenceAppearance {
	static create() {
		return {
			faceStyle: {
				widthScale: 1.06, heightScale: 1, foreheadScale: 0.86,
				templeScale: 0.96, cheekScale: 1, cheekYScale: 0.29,
				jawScale: 0.78, jawYScale: 0.74, chinScale: 0.48,
				earXScale: 0.96, earYScale: 0.01, earRX: 4.8, earRY: 8.2,
				shellScaleX: 1.55, shellScaleY: 1.52,
				shellOffsetX: 2.8, shellOffsetY: 8,
				featureOffsetX: 1, featureOffsetY: 22, lineWidth: 2.05
			},
			browStyle: {
				width: 17, thickness: 2.4, arch: 3.6,
				verticalOffset: -2, color: '#2c1b13'
			},
			noseStyle: { sizeScale: 0.98, verticalOffset: 0.5, lineWidth: 1.55 },
			eyeStyle: {
				radiusX: 11.4, radiusY: 11.7, spacingScale: 0.99,
				separationRatio: 0.8, pupilScale: 0.68, pupilVertical: 0.24,
				outlineWidth: 1.55, lidWidth: 1.5, lashes: true,
				lashScale: 1.16, rotation: -0.035, verticalOffset: 1
			},
			mouthStyle: {
				kind: 'rose_lips', lipColor: '#a94f55', widthScale: 1.28,
				heightScale: 0.76, smileBias: 0.2, lineWidth: 1.8,
				lowerLipWidth: 1.7, verticalOffset: 0.5
			},
			hairStyle: { partX: 0.28 },
			headwear: {
				type: 'head_wrap', size: 0.96, widthScale: 1.08,
				heightScale: 1.2, verticalOffset: 6, bandCurve: 3,
				bun: false, bunX: 0.9, bunY: 0.8,
				bunWidth: 0.26, bunHeight: 0.5,
				lineWidth: 1.9, highlightOpacity: 0.04
			},
			headTransform: { x: 0, y: -3, scaleX: 1.06, scaleY: 1.02 }
		};
	}
}
