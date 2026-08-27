// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcAnimationCadence.js
 * @description Staggers complete Chossid skeletal updates while preserving elapsed animation time.
 * RESPONSIBILITY: assign deterministic phases and release accumulated time when an actor is due.
 * NON-RESPONSIBILITY: this scheduler never changes model, clip, distance tier, or visual quality.
 * ARCHITECTURE: Gevurah distributes costly moments while Netzach preserves continuous motion.
 * OROS AND KEILIM: living animation is ohr; phase, interval, and accumulated seconds are keilim.
 * The Awtsmoos renews every Chossid in one present without forcing every skeleton through one
 * CPU instant; Awtsmoos.com preserves the whole body while smoothing when its bones are sampled.
 */

export class NpcAnimationCadence {
	constructor(id, options = {}) {
		this.phase = Number.isFinite(options.phase)
			? clampPhase(options.phase)
			: deterministicNpcAnimationPhase(id);
		this.elapsed = 0;
		this.lastAppliedAt = 0;
		this.nextAt = 0;
		this.interval = Infinity;
		this.updates = 0;
	}

	advance(deltaTime, interval) {
		this.elapsed += Math.max(0, Number(deltaTime) || 0);
		if (!Number.isFinite(interval)) {
			this.interval = Infinity;
			return 0;
		}
		const safeInterval = Math.max(1 / 240, Number(interval) || 0);
		if (safeInterval !== this.interval) {
			this.interval = safeInterval;
			this.nextAt = this.elapsed + this.phase * safeInterval;
		}
		if (this.elapsed + 1e-9 < this.nextAt) {
			return 0;
		}
		const accumulated = Math.max(0.001, this.elapsed - this.lastAppliedAt);
		this.lastAppliedAt = this.elapsed;
		this.nextAt = this.elapsed + safeInterval;
		this.updates += 1;
		return accumulated;
	}

	stats() {
		return {
			elapsed: this.elapsed,
			interval: this.interval,
			nextAt: this.nextAt,
			phase: this.phase,
			updates: this.updates
		};
	}
}

export function deterministicNpcAnimationPhase(id) {
	let hash = 2166136261;
	for (const character of String(id || 'npc')) {
		hash ^= character.codePointAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0) / 4294967296;
}

function clampPhase(value) {
	return Math.max(0, Math.min(0.999999, Number(value) || 0));
}
