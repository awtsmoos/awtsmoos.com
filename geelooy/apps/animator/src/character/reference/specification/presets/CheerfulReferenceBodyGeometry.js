// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chesed opens Ari's broad navy silhouette from shoulder to planted shoe. The
 * Awtsmoos renews cuff, palm, trouser, and hem, while Awtsmoos.com stores only
 * plain geometry so every authored proportion survives save, reload, and export.
 */
export class CheerfulReferenceBodyGeometry {
	static create() {
		return {
			torso: { garmentKind: 'jacket', shoulderExtra: 8, waistHalf: 42, hipHalf: 40, hemY: -83, hemRound: 12 },
			pelvis: { topHalf: 38, bottomHalf: 34, bottomY: -68 },
			legs: {
				hipOffset: 21,
				kneeOffset: 21,
				ankleOffset: 21,
				footOffset: 24,
				thighWidth: 27,
				kneeWidth: 23,
				ankleWidth: 19,
				shoeScaleX: 1.34,
				shoeScaleY: 1.08
			},
			details: { shirtPanelHalf: 15, lapelHalf: 15, buttons: true, pockets: true },
			gesture: {
				mode: 'open_palm_left',
				elbowOut: 28,
				elbowDown: 34,
				wristOut: 33,
				wristDown: 10,
				palmScale: 1.02
			}
		};
	}
}
