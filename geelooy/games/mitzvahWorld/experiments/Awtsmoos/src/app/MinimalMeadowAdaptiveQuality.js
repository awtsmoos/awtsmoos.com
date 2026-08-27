// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAdaptiveQuality.js
 * @description Converts rolling frame time into stable quality levels with hysteresis.
 * The Awtsmoos measures finite labor without panic; Awtsmoos.com lowers distant detail only after
 * sustained strain and restores it only after sustained ease, keeping motion readable and calm.
 */

const DEFAULT_POLICY = Object.freeze({
	degradeAfter: 24,
	fastMilliseconds: 18,
	recoverAfter: 90,
	slowMilliseconds: 27,
	smoothing: 0.08
});

const LEVELS = Object.freeze(['quality', 'balanced', 'performance']);

export class MinimalMeadowAdaptiveQuality {
	constructor(runtime, policy = DEFAULT_POLICY) {
		this.runtime = runtime;
		this.policy = policy;
		this.level = 'quality';
		this.averageMilliseconds = 16.7;
		this.fastSamples = 0;
		this.slowSamples = 0;
		this.transitions = 0;
	}

	update(deltaSeconds) {
		const milliseconds = Math.min(120, Math.max(0, Number(deltaSeconds) * 1000 || 0));
		if (!milliseconds) return false;
		const smoothing = this.policy.smoothing;
		this.averageMilliseconds += (milliseconds - this.averageMilliseconds) * smoothing;
		this.slowSamples = this.averageMilliseconds >= this.policy.slowMilliseconds
			? this.slowSamples + 1 : 0;
		this.fastSamples = this.averageMilliseconds <= this.policy.fastMilliseconds
			? this.fastSamples + 1 : 0;
		if (this.slowSamples >= this.policy.degradeAfter) return this.shift(1, 'sustained-frame-pressure');
		if (this.fastSamples >= this.policy.recoverAfter) return this.shift(-1, 'sustained-frame-headroom');
		return false;
	}

	shift(direction, reason) {
		const currentIndex = LEVELS.indexOf(this.level);
		const nextIndex = Math.max(0, Math.min(LEVELS.length - 1, currentIndex + direction));
		if (nextIndex === currentIndex) {
			this.resetCounters();
			return false;
		}
		const previous = this.level;
		this.level = LEVELS[nextIndex];
		this.transitions += 1;
		this.resetCounters();
		this.runtime.bus?.emit?.('performance:quality-changed', {
			...this.snapshot(),
			previous,
			reason
		});
		return true;
	}

	resetCounters() {
		this.fastSamples = 0;
		this.slowSamples = 0;
	}

	snapshot() {
		return Object.freeze({
			averageFps: Math.round(1000 / Math.max(1, this.averageMilliseconds)),
			averageMilliseconds: Number(this.averageMilliseconds.toFixed(2)),
			level: this.level,
			transitions: this.transitions
		});
	}

	diagnostics() {
		return this.snapshot();
	}
}

export function minimalMeadowAdaptiveQualityPolicy() {
	return DEFAULT_POLICY;
}
