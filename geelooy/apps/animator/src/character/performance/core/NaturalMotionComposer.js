// B"H
// Boruch Hashem
// Blessed is He

/**
 * Breathing, tiny drift, and conversational hands prevent frozen puppetry. The
 * Awtsmoos renews every body instant while identity remains steady beneath motion.
 */
export class NaturalMotionComposer {
	/** Applies breath, head drift, and asymmetric arm behavior. */
	static apply(pose, data, state, time) {
		const talking = this.talking(data, state);
		const seed = Number(data._index || 0) * 0.73;
		const breath = Math.sin(time * 0.0017 + seed);
		pose.body.bob = Number(pose.body.bob || 0) + breath * 1.2;
		pose.body.torsoLean = Number(pose.body.torsoLean || 0)
			+ Math.sin(time * 0.001 + seed) * 0.55;
		pose.body.headNod = Number(pose.body.headNod || 0)
			+ Math.sin(time * (talking ? 0.006 : 0.0015) + seed) * (talking ? 2.1 : 0.55);
		pose.body.headRotation = Number(pose.body.headRotation || 0)
			+ Math.sin(time * 0.0012 + seed) * 0.018;
		pose.body.torsoBreathScale = 1 + breath * 0.014;
		this.arm(pose, 'left', time, talking, state);
		this.arm(pose, 'right', time, talking, state);
	}

	/** Gives each arm a distinct idle and speech emphasis rhythm. */
	static arm(pose, side, time, talking, state) {
		const sign = side === 'right' ? 1 : -1;
		const emphasis = talking && side === 'right' ? 1 : 0;
		const speed = talking && side === 'right' ? 0.005 : 0.0016;
		const pulse = Math.sin(time * speed + sign);
		pose.arms[side].elbowX = Number(pose.arms[side].elbowX || 14)
			+ pulse * (1.4 + emphasis * 4);
		pose.arms[side].elbowY = Number(pose.arms[side].elbowY || 38)
			+ pulse * (0.8 - emphasis * 2.4);
		pose.arms[side].handX = Number(pose.arms[side].handX || 10)
			+ pulse * (1.8 + emphasis * 6);
		pose.arms[side].handY = Number(pose.arms[side].handY || 30)
			+ Math.cos(time * 0.002 + sign) * (1.4 + emphasis * 3.8);
		if (emphasis && !/point|raise|celebrate/.test(state.gesture || '')) {
			pose.arms[side].handPose = 'open';
		}
	}

	/** Detects speech from every supported production contract. */
	static talking(data, state) {
		return Boolean(
			data.isTalking
			|| data.speaking
			|| (state.speech && state.speech !== 'none')
			|| state.dialogue
		);
	}
}
