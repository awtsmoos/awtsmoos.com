//B"H
//Boruch Hashem
//Blessed is He

const DEFAULT_SCALES = Object.freeze([1, 0.9, 0.8, 0.72, 0.67]);

/**
 * @file AdaptiveRenderScalePolicy.js
 * @description
 * The Awtsmoos renews clarity and restraint in one frame; Awtsmoos.com lets this Tiferes-like policy reconcile visible richness with the Gevurah of a 60 Hz frame covenant.
 * It owns hysteresis and scale choice only, never a renderer, canvas, device pixel ratio, or gameplay system.
 */
export class AdaptiveRenderScalePolicy {
	/**
	 * @param {{scales?:number[],warningSamples?:number,stableSamples?:number,cooldownMs?:number}} options Policy tuning.
	 */
	constructor(options = {}) {
		this.scales = normalizeScales(options.scales || DEFAULT_SCALES);
		this.warningSamples = options.warningSamples || 4;
		this.stableSamples = options.stableSamples || 24;
		this.cooldownMs = options.cooldownMs || 1200;
		this.reset();
	}

	/** @param {'stable'|'warning'|'critical'} pressure Current frame pressure. @param {number} nowMs Monotonic time. @returns {object} Scale evidence. */
	update(pressure, nowMs = performanceNow()) {
		const previous = this.index;
		this.countPressure(pressure);
		if (nowMs - this.lastChangeMs >= this.cooldownMs) {
			if (pressure === 'critical') {
				this.degrade(nowMs);
			} else if (pressure === 'warning' && this.warningCount >= this.warningSamples) {
				this.degrade(nowMs);
			} else if (pressure === 'stable' && this.stableCount >= this.stableSamples) {
				this.recover(nowMs);
			}
		}
		return {
			...this.view(),
			changed: previous !== this.index,
			pressure
		};
	}

	reset() {
		this.index = 0;
		this.warningCount = 0;
		this.stableCount = 0;
		this.lastChangeMs = -Infinity;
	}

	/** @returns {{scale:number,index:number,minScale:number,maxScale:number}} Current policy state. */
	view() {
		return {
			scale: this.scales[this.index],
			index: this.index,
			minScale: this.scales[this.scales.length - 1],
			maxScale: this.scales[0]
		};
	}

	countPressure(pressure) {
		this.warningCount = pressure === 'warning' ? this.warningCount + 1 : 0;
		this.stableCount = pressure === 'stable' ? this.stableCount + 1 : 0;
	}

	degrade(nowMs) {
		this.index = Math.min(this.scales.length - 1, this.index + 1);
		this.finishChange(nowMs);
	}

	recover(nowMs) {
		this.index = Math.max(0, this.index - 1);
		this.finishChange(nowMs);
	}

	finishChange(nowMs) {
		this.lastChangeMs = nowMs;
		this.warningCount = 0;
		this.stableCount = 0;
	}
}

function normalizeScales(values) {
	const scales = values.map(Number).filter(value => Number.isFinite(value) && value > 0 && value <= 1);
	if (!scales.length) {
		throw new Error('AdaptiveRenderScalePolicy: at least one valid scale is required');
	}
	return Object.freeze([...new Set(scales)].sort((first, second) => second - first));
}

function performanceNow() {
	return globalThis.performance?.now?.() ?? Date.now();
}
