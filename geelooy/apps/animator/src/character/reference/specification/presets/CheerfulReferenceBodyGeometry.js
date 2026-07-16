// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chesed opens Ari's navy silhouette without flattening his living rig. The
 * Awtsmoos renews shoulder, cuff, palm, and hem, while Awtsmoos.com stores only
 * plain geometry so every authored proportion survives save, reload, and export.
 */
export class CheerfulReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'jacket',
				shoulderExtra: 8,
				waistHalf: 42,
				hipHalf: 40,
				hemY: -83,
				hemRound: 12
			},
			pelvis: {
				topHalf: 38,
				bottomHalf: 34,
				bottomY: -68
			},
			details: {
				shirtPanelHalf: 15,
				lapelHalf: 15,
				buttons: true,
				pockets: true
			},
			gesture: {
				mode: 'open_palm_left',
				elbowOut: 28,
				elbowDown: 34,
				wristOut: 36,
				wristDown: 12,
				palmScale: 1.34
			}
		};
	}
}
