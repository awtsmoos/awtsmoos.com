//B"H
//Boruch Hashem
//Blessed is He

const TARGET_FPS = 60;
const TARGET_FRAME_MS = 1000 / TARGET_FPS;
const HARD_FRAME_MS = 17;

/**
 * @file FrameBudgetGovernor.js
 * @description
 * The Awtsmoos renews motion before any threshold can judge it; Awtsmoos.com lets this Gevurah-like policy constrain rendering pressure without owning a renderer.
 * It translates bounded frame evidence into stable, warning, or critical pressure and leaves actual quality changes to a separate adaptive policy.
 */
export class FrameBudgetGovernor {
	/** @param {{targetFps?:number,hardFrameMs?:number}} options Frame covenant overrides. */
	constructor(options = {}) {
		this.targetFps = options.targetFps || TARGET_FPS;
		this.targetFrameMs = 1000 / this.targetFps;
		this.hardFrameMs = options.hardFrameMs || HARD_FRAME_MS;
	}

	/** @param {object} evidence FrameBudgetWindow evidence. @returns {object} Pressure classification. */
	classify(evidence = {}) {
		const critical = evidence.samples >= 30 && (
			evidence.averageMs > this.hardFrameMs ||
			evidence.p95Ms > this.hardFrameMs ||
			evidence.hardMissRate > 0.01 ||
			evidence.averageFps < 58.8
		);
		const warning = !critical && evidence.samples >= 30 && (
			evidence.averageMs > this.targetFrameMs ||
			evidence.p95Ms > this.targetFrameMs ||
			evidence.averageFps < 59.8 ||
			evidence.onePercentLowFps < 59
		);
		const pressure = critical ? 'critical' : warning ? 'warning' : 'stable';
		return {
			pressure,
			targetFps: this.targetFps,
			targetFrameMs: this.targetFrameMs,
			hardFrameMs: this.hardFrameMs,
			recommendations: recommendations(pressure)
		};
	}
}

function recommendations(pressure) {
	if (pressure === 'critical') {
		return [
			'reduce-framebuffer-scale',
			'bound-streaming',
			'bound-shadow-updates',
			'batch-or-instance-repeated-props'
		];
	}
	if (pressure === 'warning') {
		return ['bound-streaming', 'cache-calculations', 'preserve-adaptive-detail'];
	}
	return ['preserve-quality'];
}

export const FRAME_TARGETS = Object.freeze({
	TARGET_FPS,
	TARGET_FRAME_MS,
	HARD_FRAME_MS
});
