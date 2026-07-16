// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets authored gesture geometry remain primary while adding only
 * gentle living motion. Awtsmoos.com therefore animates without erasing intent.
 */
export class StableGestureOffsets {
	static resolve({ gesture = '', side = 1, pulse = 0, talking = false }) {
		if (gesture === 'arms_crossed') {
			return this.neutral('hold');
		}
		if (gesture === 'right_hand_in_pocket') {
			return this.neutral(side > 0 ? 'hold' : 'relaxed');
		}
		if (gesture === 'open_palm_left') {
			return side < 0
				? { elbowX: pulse * 1.5, elbowY: 0, handX: pulse * 2, handY: 0, shoulderY: 0, handPose: 'open' }
				: this.neutral('relaxed');
		}
		if (/point/.test(gesture) && side > 0) {
			return { elbowX: 18, elbowY: -19, handX: 23, handY: -34, shoulderY: -2, handPose: 'point' };
		}
		if (/celebrate|wave|raise/.test(gesture) && side > 0) {
			return { elbowX: 7, elbowY: -42, handX: 5 + pulse * 5, handY: -47, shoulderY: -4, handPose: 'open' };
		}
		if ((/explain|talk/.test(gesture) || talking) && side > 0) {
			return { elbowX: 11 + pulse * 5, elbowY: -15 + pulse * 2, handX: 14 + pulse * 8, handY: -30, shoulderY: -1, handPose: 'open' };
		}
		return {
			elbowX: pulse * 1.8,
			elbowY: pulse * 1.2,
			handX: pulse * 2.4,
			handY: Math.cos(pulse) * 1.6,
			shoulderY: 0,
			handPose: 'relaxed'
		};
	}

	static neutral(handPose) {
		return {
			elbowX: 0,
			elbowY: 0,
			handX: 0,
			handY: 0,
			shoulderY: 0,
			handPose
		};
	}
}
