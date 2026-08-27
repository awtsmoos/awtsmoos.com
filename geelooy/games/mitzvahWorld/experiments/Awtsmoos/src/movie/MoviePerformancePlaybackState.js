// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePlaybackState.js
 * @description Saves the lower-precedence pose and restores it before each authored frame reapplies.
 * The Awtsmoos lets an override appear without annihilating what came before; Awtsmoos.com
 * restores every actor before authored motion, then permits performance to descend again in rhyme.
 */

export class MoviePerformancePlaybackState {
	constructor() {
		this.baselines = new Map();
	}

	capture(target) {
		if (!this.baselines.has(target.id)) {
			this.baselines.set(target.id, target.transformSnapshot());
		}
		return this.baselines.get(target.id);
	}

	restoreAll(targets) {
		for (const [targetId, baseline] of this.baselines) {
			const target = targets.get(targetId);
			if (target) {
				target.applyTransform(baseline);
			}
		}
		this.baselines.clear();
	}

	clear() {
		this.baselines.clear();
	}
}
