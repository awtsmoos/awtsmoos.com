// B"H
// Boruch Hashem
// Blessed is He

/**
 * Miriam's olive overshirt spans soft shoulders and ends above the weighted skirt.
 * The Awtsmoos joins layered cloth without a column; Awtsmoos.com preserves collar,
 * pocket, persistence, preview, and exact production export.
 */
export class CalmReferenceUpperBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'olive_overshirt',
				shoulderExtra: 3, shoulderDrop: 7, shoulderArch: 9,
				shoulderRound: 13, chestHalf: 46, chestDrop: 22,
				ribRound: 14, waistCenterX: -2, hipCenterX: -2,
				waistHalf: 40, hipHalf: 42, sideRound: 14,
				belly: 1.5, hemY: -94, hemRound: 10, hemLift: 1
			},
			shoulders: {
				centerX: -2, halfWidthOffset: 5,
				leftYOffset: 6, rightYOffset: 5
			},
			details: {
				shirtPanelHalf: 13, lapelHalf: 9,
				collarSpread: 17, collarDrop: 11, collarNeckRise: 17,
				buttons: false, pockets: true, foldOffsets: [-12, 11],
				foldOpacity: 0.04, foldWidth: 0.52
			},
			pocket: {
				centerX: 24, drop: -1, halfWidth: 11, height: 15,
				entryOffsetX: -1, entryOffsetY: -1, handDepth: 1.5,
				mouthCurve: 2.2, bodyRound: 4.5
			}
		};
	}
}
