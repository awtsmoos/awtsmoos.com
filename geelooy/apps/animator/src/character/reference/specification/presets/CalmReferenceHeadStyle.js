// B"H
// Boruch Hashem
// Blessed is He

/**
 * Miriam's rounded wrap cups the skull, reveals a swept side fringe, and gathers
 * into one calm bun. The Awtsmoos renews every layer, while Awtsmoos.com keeps
 * her complete silhouette editable, keyframeable, and production-rendered.
 */
export class CalmReferenceHeadStyle {
	static create() {
		return {
			hairStyle: {
				partX: 0.4,
				fringeLeftReach: 0.82,
				fringeRightReach: 0.38,
				fringeTipX: 0.5,
				fringeCrownDepth: 0.72,
				fringeSideDepth: 0.28,
				fringeTipDepth: 0.2,
				fringeLineWidth: 0.95
			},
			headwear: {
				type: 'head_wrap',
				size: 0.98,
				shellWidth: 0.94,
				widthScale: 1,
				heightScale: 0.94,
				baselineScale: 0.63,
				crownHeight: 0.54,
				apexShift: -0.04,
				frontSlope: 3.8,
				verticalOffset: 0,
				bandCurve: 2.3,
				rearWidth: 1.01,
				rearDepth: 0.74,
				bun: true,
				bunX: 1,
				bunY: 2.12,
				bunWidth: 0.38,
				bunHeight: 0.62,
				lineWidth: 1,
				highlightOpacity: 0.016
			},
			headTransform: {
				x: 0,
				y: -3,
				scaleX: 1.04,
				scaleY: 1.02
			}
		};
	}
}
