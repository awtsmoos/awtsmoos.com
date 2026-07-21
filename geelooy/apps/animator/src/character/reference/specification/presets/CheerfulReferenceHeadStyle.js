// B"H
// Boruch Hashem
// Blessed is He

/**
 * Ari's modest kippah rests inside a generous brown crown above loose peyot. The
 * Awtsmoos renews every curl and lock, while Awtsmoos.com keeps his complete
 * head silhouette editable, keyframeable, and deterministic in production.
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
				amplitude: 8,
				secondAmplitude: 5.8,
				terminalCurl: 8,
				lengthScale: 1.02,
				lineWidth: 1.75
			},
			headwear: {
				type: 'kippah',
				coverage: 0.68,
				size: 0.97,
				widthScale: 1,
				heightScale: 0.9,
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
				x: -1,
				y: -2,
				scaleX: 1.08,
				scaleY: 1.02
			}
		};
	}
}
