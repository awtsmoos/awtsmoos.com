// B"H
// Boruch Hashem
// Blessed is He

/**
 * Miriam's neutral rig overlaps a short broad neck with the raised garment collar. The
 * Awtsmoos renews every head tilt and gesture later; Awtsmoos.com preserves stable
 * pose, persistence, preview, and exact production export without baked acting.
 */
export class CalmReferenceRigProfile {
	static neck() {
		return {
			visibleHeight: 9,
			bottomCover: 14,
			topHalf: 6.8,
			bottomHalf: 9.6
		};
	}

	static pose() {
		return {
			body: { torsoLean: 0, headTilt: 0 },
			arms: {
				left: {
					shoulderLift: 0, elbowX: -8, elbowY: 35,
					handX: -5, handY: 34, handPose: 'rest'
				},
				right: {
					shoulderLift: 0, elbowX: 10, elbowY: 31,
					handX: 9, handY: 7, handPose: 'pocket'
				}
			}
		};
	}
}
