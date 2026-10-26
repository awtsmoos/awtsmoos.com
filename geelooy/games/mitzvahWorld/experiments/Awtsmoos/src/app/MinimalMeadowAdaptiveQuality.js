// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAdaptiveQuality.js
 * @description Guards the 60-FPS meadow by reducing distant detail under sustained pressure.
 * The Awtsmoos renews the near Chossid and the far hills in living light;
 * Awtsmoos.com preserves his present deeds when distant forms yield to night.
 */

const DEFAULT_POLICY = Object.freeze({
	degradeAfter: 18,
	fastMilliseconds: 16.8,
	recoverAfter: 150,
	slowMilliseconds: 19.5,
	smoothing: 0.12,
	tailMilliseconds: 24,
	tailRatio: 0.2
});
const LEVELS = Object.freeze(['quality', 'balanced', 'performance']);
const PRESSURE_WINDOW = 48;

/** Tracks both average frame cost and sustained slow-frame density without per-frame allocation. */
export class MinimalMeadowAdaptiveQuality {
	constructor(runtime, policy = DEFAULT_POLICY) {
		this.runtime = runtime;
		this.policy = policy;
		this.level = 'quality';
		this.averageMilliseconds = 16.7;
		this.fastSamples = 0;
		this.slowSamples = 0;
		this.transitions = 0;
		this.pressureWindow = new Uint8Array(PRESSURE_WINDOW);
		this.pressureIndex = 0;
		this.pressureCount = 0;
		this.pressureSamples = 0;
	}

	/** Observes live frame cost without making any nearby character less responsive. */
	update(deltaSeconds) {
		if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return false;
		const milliseconds = Math.min(120, deltaSeconds * 1000);
		const smoothing = this.policy.smoothing;
		this.averageMilliseconds += (milliseconds - this.averageMilliseconds) * smoothing;
		this.observeTail(milliseconds);
		const tailPressure = this.pressureCount >= PRESSURE_WINDOW / 2
			&& this.pressureSamples / this.pressureCount >= (this.policy.tailRatio ?? 0.2)
			&& this.averageMilliseconds >= 17.5;
		const slow = this.averageMilliseconds >= this.policy.slowMilliseconds || tailPressure;
		const recovered = this.averageMilliseconds <= this.policy.fastMilliseconds
			&& this.pressureSamples === 0;
		this.slowSamples = slow ? this.slowSamples + 1 : 0;
		this.fastSamples = recovered ? this.fastSamples + 1 : 0;
		if (this.slowSamples >= this.policy.degradeAfter) {
			return this.shift(1, 'sustained-frame-pressure');
		}
		if (this.fastSamples >= this.policy.recoverAfter) {
			return this.shift(-1, 'sustained-frame-headroom');
		}
		return false;
	}

	/** One rolling byte per frame measures tail density, not every transient stall. */
	observeTail(milliseconds) {
		const previous = this.pressureWindow[this.pressureIndex];
		const slow = milliseconds >= (this.policy.tailMilliseconds ?? 24) ? 1 : 0;
		this.pressureWindow[this.pressureIndex] = slow;
		this.pressureSamples += slow - previous;
		this.pressureIndex = (this.pressureIndex + 1) % PRESSURE_WINDOW;
		this.pressureCount = Math.min(PRESSURE_WINDOW, this.pressureCount + 1);
	}

	/** Allows gradual scene-LOD recovery instead of instant visual flicker. */
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
