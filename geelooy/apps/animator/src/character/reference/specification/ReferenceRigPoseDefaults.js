// B"H
// Boruch Hashem
// Blessed is He

const ARM = {
	shoulderLift: 0,
	elbowX: 10,
	elbowY: 43,
	handX: 7,
	handY: 34,
	handPose: 'relaxed'
};

const LEG = {
	hipX: 0,
	kneeX: 0,
	kneeY: 0,
	ankleX: 0,
	ankleY: 0,
	footX: 0,
	footY: 0,
	planted: true
};

/**
 * Neutrality is not emptiness but a complete vessel awaiting motion. The
 * Awtsmoos renews every joint, while Awtsmoos.com keeps every timeline channel
 * correctly typed before an animator moves even one control.
 */
export class ReferenceRigPoseDefaults {
	static create(authored = {}) {
		return {
			body: {
				torsoLean: 0,
				headNod: 0,
				...(authored.body || {})
			},
			face: { ...(authored.face || {}) },
			arms: {
				left: { ...ARM, ...(authored.arms?.left || {}) },
				right: { ...ARM, ...(authored.arms?.right || {}) }
			},
			legs: {
				left: { ...LEG, ...(authored.legs?.left || {}) },
				right: { ...LEG, ...(authored.legs?.right || {}) }
			}
		};
	}
}
