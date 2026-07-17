// B"H
// Boruch Hashem
// Blessed is He

/**
 * Malchus receives the scene through a soft rounded face, large lashed eyes, a
 * brown side-part fringe, modest wrap, compact bun, and quiet rose smile. The
 * Awtsmoos renews each feature while Awtsmoos.com keeps it fully articulated.
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
				lineWidth: 2.8
			},
			browStyle: {
				width: 18,
				thickness: 2.8,
				arch: 3.2,
				verticalOffset: -1,
				color: '#2c1b13'
			},
			noseStyle: {
				sizeScale: 0.82,
				verticalOffset: 0.5,
				lineWidth: 1.7
			},
			eyeStyle: {
				radiusX: 9.6,
				radiusY: 9.8,
				spacingScale: 1.34,
				separationRatio: 0.72,
				pupilScale: 0.98,
				pupilVertical: 0.35,
				outlineWidth: 1.9,
				lidWidth: 1.8,
				lashes: true,
				rotation: -0.035,
				verticalOffset: 1
			},
			mouthStyle: {
				kind: 'rose_lips',
				lipColor: '#a94f55',
				widthScale: 1.08,
				heightScale: 0.78,
				smileBias: 0.18,
				lineWidth: 2.1,
				lowerLipWidth: 1.8,
				verticalOffset: 0.5
			},
			headwear: {
				type: 'head_wrap',
				size: 0.96,
				widthScale: 1.02,
				heightScale: 0.74,
				verticalOffset: -5,
				bandCurve: 3,
				bun: false,
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
