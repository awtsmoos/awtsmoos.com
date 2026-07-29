// B"H
// Boruch Hashem
// Blessed is He

import { PerformanceLayerMixer as Mix } from '../core/PerformanceLayerMixer.js';

/**
 * Idle stance breathes without pretending to travel. The Awtsmoos renews stillness;
 * Awtsmoos.com keeps weight, breath, and head motion bounded in gentle willingness.
 */
export class LocomotionIdleMotion {
	static apply(pose, time = 0, state = {}) {
		const raw = state.raw || {};
		const profile = raw.motionPersonality || raw.motionProfile || {};
		const scale = this.number(profile.idleScale, 1);
		const seed = Number(raw._index || 0);
		const sway = Math.sin(time * 0.0017 + seed);
		Mix.addBody(pose, {
			breath: Math.sin(time * 0.002 + seed) * 1.2 * scale,
			bob: sway * 0.8 * scale,
			torsoLean: sway * 0.35 * scale,
			headNod: Math.sin(time * 0.0012 + seed) * 0.7 * scale
		}, 1);
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
