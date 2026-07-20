// B"H
// Boruch Hashem
// Blessed is He

/**
 * Malchus receives the scene through a soft rounded face, large lashed eyes,
 * brown side-part fringe, modest wrap, compact rear bun, gold earring, and rose
 * smile. The Awtsmoos renews each feature while Awtsmoos.com keeps it articulated.
 */
export class CalmReferenceAppearance {
	static create() {
		return {
			faceStyle: {
				widthScale: 1.06,
				heightScale: 1,
				foreheadScale: 0.72,
				templeScale: 0.94,
				cheekScale: 1,
				cheekYScale: 0.29,
				jawScale: 0.73,
				jawYScale: 0.75,
				chinScale: 0.36,
				earXScale: 0.98,
				earRX: 4.8,
				earRY: 8.2,
				shellScaleX: 1.5131,
				shellScaleY: 1.5282,
				shellOffsetX: 2.7765,
				shellOffsetY: 10.7679,
				featureOffsetX: -16,
				featureOffsetY: 27,
				featureScaleX: 1,
				featureScaleY: 1,
				lineWidth: 2.8
			},
			browStyle: {
				width: 18,
				thickness: 2.8,
				arch: 3.4,
				verticalOffset: -1.5,
				color: '#2c1b13'
			},
			noseStyle: {
				sizeScale: 0.88,
				verticalOffset: 0.5,
				lineWidth: 1.7
			},
			eyeStyle: {
				radiusX: 11.8,
				radiusY: 11.6,
				spacingScale: 0.97,
				separationRatio: 0.9,
				pupilScale: 0.82,
				pupilVertical: 0.3,
				outlineWidth: 1.9,
				lidWidth: 1.8,
				lashes: true,
				lashScale: 1.28,
				rotation: -0.035,
				verticalOffset: 1
			},
			mouthStyle: {
				kind: 'rose_lips',
				lipColor: '#a94f55',
				widthScale: 1.35,
				heightScale: 0.9,
				smileBias: 0.24,
				lineWidth: 2.4,
				lowerLipWidth: 2,
				verticalOffset: 0.5
			},
			hairStyle: {
				partX: 0.28
			},
			headwear: {
				type: 'head_wrap',
				size: 0.96,
				widthScale: 1.02,
				heightScale: 0.74,
				verticalOffset: -5,
				bandCurve: 3,
				bun: true,
				bunX: 0.98,
				bunY: 0.29,
				bunWidth: 0.28,
				bunHeight: 0.31,
				lineWidth: 2.3,
				highlightOpacity: 0.04
			},
			headTransform: {
				x: 0,
				y: -3,
				scaleX: 1.06,
				scaleY: 1.02
			}
		};
	}
}
