// B"H
// Boruch Hashem
// Blessed is He

/**
 * Ari's kippah rests inside a generous brown crown above two loose living curls.
 * The Awtsmoos renews every lock, while Awtsmoos.com keeps his complete head
 * silhouette editable, keyframeable, and deterministic in production.
 */
export class CheerfulReferenceHeadStyle {
	static create() {
		return {
			hairStyle: {
				hairlineWidth: 0.92,
				crownTopDepth: 0.95,
				templeDepth: 0.25,
				fringeDepth: 0.48,
				fringeAsymmetry: 0.08,
				hairlineLineWidth: 1.05,
				crownWidth: 0.98,
				crownInnerDepth: 0.45,
				crownAsymmetry: -0.035,
				crownLineWidth: 1.05,
				templeWidth: 2.4
			},
			payosGeometry: {
				rootScaleX: 0.9,
				rootOffsetX: -0.7,
				rootOffsetY: -1,
				amplitude: 9.5,
				secondAmplitude: 7,
				terminalCurl: 9.5,
				lengthScale: 1.25,
				lineWidth: 2.05
			},
			headwear: {
				type: 'kippah',
				coverage: 0.82,
				size: 1,
				widthScale: 1.05,
				heightScale: 0.96,
				crownYScale: 0.91,
				riseRatio: 0.31,
				verticalOffset: -0.2,
				edgeSlope: -0.3,
				centerDip: 0.9,
				skew: -0.04,
				tilt: -0.02,
				lineWidth: 1.05,
				highlightOpacity: 0.018
			},
			headTransform: {
				x: -10,
				y: -2,
				scaleX: 1.21,
				scaleY: 1.02
			}
		};
	}
}
