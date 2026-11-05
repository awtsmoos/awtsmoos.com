// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdaptiveRenderScalePolicy.js
 * @description Adapts dense-display work without ever crossing the viewport clarity floor.
 * The Awtsmoos preserves the truth of every edge while finite pressure changes only surplus pixels;
 * Awtsmoos.com waits for sustained strain, responds to crisis, and restores density patiently.
 */

const BASE_SCALES = Object.freeze([1, 0.9, 0.8, 0.72, 0.67]);
const DEFAULT_FLOOR = 0.67;

export class AdaptiveRenderScalePolicy {
	constructor(runtime, options = {}) {
		this.runtime = runtime;
		this.cooldownMilliseconds = options.cooldownMilliseconds ?? 1200;
		this.stableSamplesToRecover = options.stableSamplesToRecover ?? 24;
		this.warningSamplesToReduce = options.warningSamplesToReduce ?? 4;
		this.lastChangeAt = -Infinity;
		this.stableSamples = 0;
		this.warningSamples = 0;
		this.history = [];
		this.publish(this.nearestScale(runtime.adaptiveRenderScale ?? 1));
	}

	evaluate(pressureState, nowMilliseconds) {
		this.stableSamples = pressureState === 'stable'
			? this.stableSamples + 1
			: 0;
		this.warningSamples = pressureState === 'warning'
			? this.warningSamples + 1
			: 0;
		const direction = this.direction(pressureState);
		const coolingDown = nowMilliseconds - this.lastChangeAt < this.cooldownMilliseconds;
		if (!direction || (coolingDown && pressureState !== 'critical')) {
			return this.result(false, pressureState, 'hysteresis');
		}
		const scales = this.availableScales();
		const currentIndex = nearestIndex(scales, this.runtime.adaptiveRenderScale ?? 1);
		const nextIndex = clampIndex(currentIndex + direction, scales.length);
		if (nextIndex === currentIndex) {
			return this.result(false, pressureState, 'scale-limit');
		}
		this.lastChangeAt = nowMilliseconds;
		this.stableSamples = 0;
		this.warningSamples = 0;
		this.publish(scales[nextIndex]);
		const reason = direction > 0 ? 'pressure-reduction' : 'stable-recovery';
		const result = this.result(true, pressureState, reason);
		this.history.push({ at: nowMilliseconds, ...result });
		return result;
	}

	direction(pressureState) {
		if (pressureState === 'critical') {
			return 1;
		}
		if (pressureState === 'warning' && this.warningSamples >= this.warningSamplesToReduce) {
			return 1;
		}
		if (pressureState === 'stable' && this.stableSamples >= this.stableSamplesToRecover) {
			return -1;
		}
		return 0;
	}

	availableScales() {
		const floor = Math.max(DEFAULT_FLOOR, Math.min(1, this.runtime.minimumRenderScale ?? DEFAULT_FLOOR));
		const scales = BASE_SCALES.filter(scale => scale >= floor - 0.001);
		if (Math.abs(scales.at(-1) - floor) > 0.001) {
			scales.push(floor);
		}
		return scales;
	}

	nearestScale(value) {
		const scales = this.availableScales();
		return scales[nearestIndex(scales, value)];
	}

	publish(scale) {
		this.runtime.adaptiveRenderScale = scale;
		this.runtime.resizeViewport?.();
	}

	result(changed, pressureState, reason) {
		return {
			changed,
			hardFrameMilliseconds: 17,
			pressureState,
			reason,
			scale: this.runtime.adaptiveRenderScale,
			targetFrameMilliseconds: 1000 / 60
		};
	}
}

function nearestIndex(scales, value) {
	let best = 0;
	for (let index = 1; index < scales.length; index += 1) {
		if (Math.abs(scales[index] - value) < Math.abs(scales[best] - value)) {
			best = index;
		}
	}
	return best;
}

function clampIndex(index, length) {
	return Math.max(0, Math.min(length - 1, index));
}
