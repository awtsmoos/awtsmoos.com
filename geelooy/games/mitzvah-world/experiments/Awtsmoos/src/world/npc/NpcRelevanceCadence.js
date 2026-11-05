// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcRelevanceCadence.js
 * @description Releases accumulated actor time through deterministic time-and-frame gates.
 * The Awtsmoos renews every neighbor continuously beyond finite sampling; Awtsmoos.com keeps
 * complete motion time while low frame pressure cannot force every distant actor to update again.
 */

import { deterministicNpcAnimationPhase } from './NpcAnimationCadence.js';

export class NpcRelevanceCadence {
	constructor(id, options = {}) {
		this.phase = Number.isFinite(options.phase)
			? clampPhase(options.phase)
			: deterministicNpcAnimationPhase(id);
		this.elapsed = 0;
		this.frames = 0;
		this.interval = Infinity;
		this.lastAppliedAt = 0;
		this.minimumFrames = Infinity;
		this.nextAt = Infinity;
		this.nextFrame = Infinity;
		this.updates = 0;
	}

	advance(deltaTime, interval, minimumFrames) {
		this.elapsed += Math.max(0, Number(deltaTime) || 0);
		this.frames += 1;
		if (!Number.isFinite(interval) || !Number.isFinite(minimumFrames)) {
			this.enterDormantState();
			return 0;
		}
		const safeInterval = Math.max(1 / 240, Number(interval) || 0);
		const safeFrames = Math.max(1, Math.floor(Number(minimumFrames) || 1));
		this.applyPolicy(safeInterval, safeFrames);
		if (this.elapsed + 1e-9 < this.nextAt || this.frames < this.nextFrame) return 0;
		const accumulated = Math.max(0.001, this.elapsed - this.lastAppliedAt);
		this.lastAppliedAt = this.elapsed;
		this.nextAt = this.elapsed + safeInterval;
		this.nextFrame = this.frames + safeFrames;
		this.updates += 1;
		return accumulated;
	}

	stats() {
		return {
			elapsed: this.elapsed,
			frames: this.frames,
			interval: this.interval,
			minimumFrames: this.minimumFrames,
			nextAt: this.nextAt,
			nextFrame: this.nextFrame,
			phase: this.phase,
			updates: this.updates
		};
	}

	applyPolicy(interval, minimumFrames) {
		if (interval === this.interval && minimumFrames === this.minimumFrames) return;
		this.interval = interval;
		this.minimumFrames = minimumFrames;
		this.nextAt = this.elapsed + this.phase * interval;
		this.nextFrame = this.frames + Math.floor(this.phase * minimumFrames);
	}

	enterDormantState() {
		this.interval = Infinity;
		this.minimumFrames = Infinity;
		this.nextAt = Infinity;
		this.nextFrame = Infinity;
		this.lastAppliedAt = this.elapsed;
	}
}

function clampPhase(value) {
	return Math.max(0, Math.min(0.999999, Number(value) || 0));
}
