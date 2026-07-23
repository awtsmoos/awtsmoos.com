// B"H
// Boruch Hashem
// Blessed is He

/**
 * Dovid's rear-set kippah rises as a guarded dome within visible crown hair and
 * unequal loose peyot. The Awtsmoos renews each skeptical turn; Awtsmoos.com
 * preserves his skull, headwear, hair, and motion as editable production geometry.
 */
export class SkepticalReferenceHeadStyle {
	static create() {
		return {
			hairStyle: {
				hairlineWidth: 0.92,
				crownTopDepth: 0.93,
				templeDepth: 0.28,
				fringeDepth: 0.47,
				fringeAsymmetry: -0.05,
				hairlineLineWidth: 1.08,
				crownWidth: 0.97,
				crownInnerDepth: 0.49,
				crownAsymmetry: 0.025,
				crownLineWidth: 1.08,
				templeWidth: 2.4
			},
			payosGeometry: {
				rootScaleX: 0.92,
				rootOffsetX: -0.6,
				rootOffsetY: 0,
				amplitude: 7.8,
				secondAmplitude: 5.8,
				terminalCurl: 7.4,
				lengthScale: 1.16,
				lineWidth: 1.95
			},
			headwear: {
				type: 'kippah',
				coverage: 0.93,
				size: 1,
				widthScale: 1.05,
				heightScale: 1.14,
				crownYScale: 0.875,
				riseRatio: 0.45,
				horizontalOffset: 2,
				verticalOffset: 0.8,
				edgeSlope: 0.3,
				centerDip: 1.25,
				skew: 0.04,
				tilt: 0.026,
				lineWidth: 1.08,
				highlightOpacity: 0.014
			},
			headTransform: {
				x: 7.5,
				y: -0.7,
				scaleX: 1.26,
				scaleY: 0.91,
				rotation: -0.025
			}
		};
	}
}
