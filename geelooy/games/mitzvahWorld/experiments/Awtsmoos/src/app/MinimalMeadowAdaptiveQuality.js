// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAdaptiveQuality.js
 * @description Protects 60-FPS play by reducing distant LOD under sustained frame pressure.
 * The Awtsmoos renews the nearby Chossid and distant hills in living light;
 * Awtsmoos.com preserves near interaction when far details yield to night.
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

/** Tracks average cost and bounded slow-frame density without per-frame allocation. */
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

	/** Protects nearby gameplay by adapting only existing distant-scene consumers. */
	update(deltaSeconds) {
		if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return false;
		const milliseconds = Math.min(120, deltaSeconds * 1000);
		this.averageMilliseconds += (milliseconds - this.averageMilliseconds) * this.policy.smoothing;
		this.observeTail(milliseconds);
		const tailPressure = this.pressureCount >= PRESSURE_WINDOW / 2
			&& this.pressureSamples / this.pressureCount >= (this.policy.tailRatio ?? 0.2)
			&& this.averageMilliseconds >= 17.5;
		const slow = this.averageMilliseconds >= this.policy.slowMilliseconds || tailPressure;
		// Explicit lightweight test policies retain their former fast-recovery contract.
		const tailCleared = this.policy.tailMilliseconds === undefined || this.pressureSamples === 0;
		const recovered = this.averageMilliseconds <= this.policy.fastMilliseconds && tailCleared;
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

	/** Measures slow-tail frame density with one preallocated byte per frame slot. */
	observeTail(milliseconds) {
		const previous = this.pressureWindow[this.pressureIndex];
		const slow = milliseconds >= (this.policy.tailMilliseconds ?? 24) ? 1 : 0;
		this.pressureWindow[this.pressureIndex] = slow;
		this.pressureSamples += slow - previous;
		this.pressureIndex = (this.pressureIndex + 1) % PRESSURE_WINDOW;
		this.pressureCount = Math.min(PRESSURE_WINDOW, this.pressureCount + 1);
	}

	/** Reduces visual distance gradually, restoring beauty only after stable headroom. */
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
