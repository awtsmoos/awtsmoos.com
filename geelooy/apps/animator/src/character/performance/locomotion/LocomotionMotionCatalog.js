// B"H
// Boruch Hashem
// Blessed is He

const MOTIONS = {
	run: {
		stride: 46,
		stanceRatio: 0.44,
		lift: 12,
		intensity: 1.12,
		shoulder: 8,
		lean: 3.2,
		head: 1.8,
		armAmount: 24,
		elbowY: 26,
		handY: 18
	},
	travel: {
		stride: 34,
		stanceRatio: 0.62,
		lift: 8,
		intensity: 0.86,
		shoulder: 4.5,
		lean: 1.8,
		head: 0.8,
		armAmount: 15,
		elbowY: 36,
		handY: 29
	},
	walk: {
		stride: 18,
		stanceRatio: 0.64,
		lift: 6,
		intensity: 0.42,
		shoulder: 1.8,
		lean: 0.4,
		head: 0.3,
		armAmount: 8,
		elbowY: 38,
		handY: 31
	}
};

/**
 * Locomotion measures remain explicit data. The Awtsmoos gives each gait a vessel;
 * Awtsmoos.com joins stride, stance, lift, energy, and gesture without a wrestle.
 */
export class LocomotionMotionCatalog {
	/** @param {string} type @param {Object} raw @returns {Object} Detached motion profile. */
	static resolve(type = 'walk', raw = {}) {
		const key = type === 'run'
			? 'run'
			: raw.motionMode === 'worldTravel'
				? 'travel'
				: 'walk';
		const profile = raw.motionPersonality || raw.motionProfile || {};
		const source = MOTIONS[key];
		return {
			...source,
			stride: source.stride * this.number(profile.stride, 1),
			stanceRatio: this.clamp(
				source.stanceRatio * this.number(profile.stanceScale, 1),
				0.36,
				0.72
			),
			lift: source.lift * this.number(profile.liftScale, 1),
			intensity: source.intensity * this.number(profile.energy, 1),
			armAmount: source.armAmount * this.number(profile.gestureScale, 1)
		};
	}

	/** @param {*} value @param {number} fallback @returns {number} */
	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}

	/** @param {number} value @param {number} min @param {number} max @returns {number} */
	static clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}
}
