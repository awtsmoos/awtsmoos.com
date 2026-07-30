// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePlaybackState.js
 * @description Refreshes authored baselines each frame and restores them whenever performance departs.
 * The Awtsmoos lets an override appear without annihilating what came before; Awtsmoos.com
 * keeps each actor's newest authored pose so mute, delete, undo, bypass, and stop restore rhyme.
 */

export class MoviePerformancePlaybackState {
	constructor() {
		this.baselines = new Map();
		this.applied = new Set();
	}

	refreshAppliedBaselines(targets) {
		for (const targetId of this.applied) {
			const target = targets.get(targetId);
			if (target) {
				this.baselines.set(targetId, target.transformSnapshot());
			}
		}
	}

	capture(target) {
		if (!this.baselines.has(target.id)) {
			this.baselines.set(target.id, target.transformSnapshot());
		}
		this.applied.add(target.id);
		return this.baselines.get(target.id);
	}

	restoreInactive(targets, activeIds) {
		for (const targetId of [...this.applied]) {
			if (activeIds.has(targetId)) {
				continue;
			}
			const target = targets.get(targetId);
			const baseline = this.baselines.get(targetId);
			if (target && baseline) {
				target.applyTransform(baseline);
			}
			this.applied.delete(targetId);
			this.baselines.delete(targetId);
		}
	}

	restoreAll(targets) {
		this.refreshAppliedBaselines(targets);
		this.restoreInactive(targets, new Set());
	}

	clear() {
		this.baselines.clear();
		this.applied.clear();
	}
}
