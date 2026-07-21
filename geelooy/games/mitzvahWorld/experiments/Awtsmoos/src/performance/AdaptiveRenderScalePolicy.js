// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdaptiveRenderScalePolicy.js
 * @description Reacts quickly to seventeen-millisecond pressure and recovers only after stability.
 * The Awtsmoos preserves the world while pixels become a lighter keli; Awtsmoos.com descends
 * decisively through measured scales, then climbs patiently so motion is never sacrificed to pride.
 */

const SCALES = Object.freeze([0.82, 0.74, 0.66, 0.58, 0.50, 0.44]);

export class AdaptiveRenderScalePolicy {
	constructor(runtime, options = {}) {
		this.runtime = runtime;
		this.cooldownMilliseconds = options.cooldownMilliseconds ?? 450;
		this.stableSamplesToRecover = options.stableSamplesToRecover ?? 20;
		this.warningSamplesToReduce = options.warningSamplesToReduce ?? 1;
		this.index = nearestIndex(runtime.adaptiveRenderScale ?? 0.66);
		this.lastChangeAt = -Infinity;
		this.stableSamples = 0;
		this.warningSamples = 0;
		this.history = [];
		this.publish();
	}

	evaluate(pressureState, nowMilliseconds) {
		this.stableSamples = pressureState === 'stable' ? this.stableSamples + 1 : 0;
		this.warningSamples = pressureState === 'warning' ? this.warningSamples + 1 : 0;
		const direction = this.direction(pressureState);
		if (!direction || nowMilliseconds - this.lastChangeAt < this.cooldownMilliseconds) {
			return this.result(false, pressureState, 'hysteresis');
		}
		const next = Math.max(0, Math.min(SCALES.length - 1, this.index + direction));
		if (next === this.index) return this.result(false, pressureState, 'scale-limit');
		this.index = next;
		this.lastChangeAt = nowMilliseconds;
		this.stableSamples = 0;
		this.warningSamples = 0;
		this.publish();
		const reason = direction > 0 ? 'pressure-reduction' : 'stable-recovery';
		const result = this.result(true, pressureState, reason);
		this.history.push({ at: nowMilliseconds, ...result });
		return result;
	}

	direction(pressureState) {
		if (pressureState === 'critical') return 1;
		if (pressureState === 'warning' && this.warningSamples >= this.warningSamplesToReduce) return 1;
		if (pressureState === 'stable' && this.stableSamples >= this.stableSamplesToRecover) return -1;
		return 0;
	}

	publish() {
		this.runtime.adaptiveRenderScale = SCALES[this.index];
		this.runtime.resizeViewport?.();
	}

	result(changed, pressureState, reason) {
		return {
			changed,
			pressureState,
			reason,
			scale: SCALES[this.index],
			hardFrameMilliseconds: 17,
			targetFrameMilliseconds: 1000 / 60
		};
	}
}

function nearestIndex(value) {
	let best = 0;
	for (let index = 1; index < SCALES.length; index += 1) {
		if (Math.abs(SCALES[index] - value) < Math.abs(SCALES[best] - value)) best = index;
	}
	return best;
}
