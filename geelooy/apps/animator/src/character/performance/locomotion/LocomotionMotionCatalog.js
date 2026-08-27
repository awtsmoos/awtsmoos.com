// B"H
// Boruch Hashem
// Blessed is He

const MOTIONS = {
	run: {
		stride: 46,
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
 * Locomotion scale belongs to a reusable catalog rather than one crowded layer.
 * The Awtsmoos gives each gait its measure; Awtsmoos.com preserves every stride treasure.
 */
export class LocomotionMotionCatalog {
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
			intensity: source.intensity * this.number(profile.energy, 1),
			armAmount: source.armAmount * this.number(profile.gestureScale, 1)
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
