// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets authored gesture geometry remain primary while adding only
 * gentle living motion. Awtsmoos.com therefore animates without erasing intent.
 */
export class StableGestureOffsets {
	/** Resolves legacy offsets only when no evaluated phased pose is available. */
	static resolve({
		gesture = '',
		side = 1,
		pulse = 0,
		talking = false,
		evaluated = false,
		handPose = 'relaxed'
	}) {
		if (evaluated) {
			return this.neutral(handPose);
		}
		if (gesture === 'arms_crossed') {
			return this.neutral('hold');
		}
		if (gesture === 'right_hand_in_pocket') {
			return this.neutral(side > 0 ? 'hold' : 'relaxed');
		}
		if (gesture === 'open_palm_left') {
			return side < 0
				? this.offset(pulse * 1.5, 0, pulse * 2, 0, 0, 'open')
				: this.neutral('relaxed');
		}
		if (/point/.test(gesture) && side > 0) {
			return this.offset(18, -19, 23, -34, -2, 'point');
		}
		if (/celebrate|wave|raise/.test(gesture) && side > 0) {
			return this.offset(7, -42, 5 + pulse * 5, -47, -4, 'open');
		}
		if ((/explain|talk/.test(gesture) || talking) && side > 0) {
			return this.offset(
				11 + pulse * 5,
				-15 + pulse * 2,
				14 + pulse * 8,
				-30,
				-1,
				'open'
			);
		}
		return this.offset(
			pulse * 1.8,
			pulse * 1.2,
			pulse * 2.4,
			Math.cos(pulse) * 1.6,
			0,
			'relaxed'
		);
	}

	/** Creates one descriptive offset vessel. */
	static offset(elbowX, elbowY, handX, handY, shoulderY, handPose) {
		return { elbowX, elbowY, handX, handY, shoulderY, handPose };
	}

	/** Creates a zero-motion fallback while preserving hand articulation. */
	static neutral(handPose) {
		return this.offset(0, 0, 0, 0, 0, handPose);
	}
}
