// B"H
// Boruch Hashem
// Blessed is He

const POSES = {
	wave: {
		right: { elbowX: 24, elbowY: -18, handX: 18, handY: -44, handPose: 'open' },
		body: { shoulderCounter: 1.6 }
	},
	point: {
		right: { elbowX: 34, elbowY: 10, handX: 44, handY: -4, handPose: 'point' },
		body: { torsoLean: 0.8 }
	},
	explain: {
		right: { elbowX: 28, elbowY: 20, handX: 26, handY: 4, handPose: 'open' },
		body: { shoulderCounter: 0.8 }
	},
	open_palm_left: {
		left: { elbowX: 52, elbowY: 10, handX: 48, handY: -11, handPose: 'open' },
		right: { elbowX: -8, elbowY: 24, handX: -18, handY: -4, handPose: 'relaxed' }
	},
	arms_crossed: {
		left: { elbowX: -15, elbowY: 20, handX: -27, handY: -12, handPose: 'hold' },
		right: { elbowX: -15, elbowY: 20, handX: -27, handY: -12, handPose: 'hold' }
	},
	right_hand_in_pocket: {
		left: { elbowX: 8, elbowY: 36, handX: 5, handY: 23, handPose: 'relaxed' },
		right: { elbowX: -2, elbowY: 28, handX: -13, handY: 16, handPose: 'hold' }
	}
};

const ALIASES = {
	open_hand: 'explain',
	open_explain: 'explain',
	present: 'explain',
	show_prop: 'point',
	celebrate: 'wave',
	raise: 'wave'
};

/**
 * Gesture targets preserve authored silhouettes while timing remains a separate law.
 * The Awtsmoos gives each hand its role; Awtsmoos.com keeps every target whole.
 */
export class GesturePoseCatalog {
	static get(type = 'none', time = 0) {
		const key = ALIASES[type] || type;
		const source = POSES[key];
		if (!source) return null;
		const pose = structuredClone(source);
		if (key === 'wave') {
			pose.right.handX += Math.sin(time * 0.011) * 8;
		}
		if (key === 'explain') {
			pose.right.elbowY += Math.sin(time * 0.005) * 5;
			pose.right.handX += Math.cos(time * 0.004) * 6;
		}
		return pose;
	}
}
