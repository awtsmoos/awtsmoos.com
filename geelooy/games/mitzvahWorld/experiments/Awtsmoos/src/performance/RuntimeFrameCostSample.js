// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeFrameCostSample.js
 * @description Measures named synchronous frame tasks without allocating inside each task.
 * RESPONSIBILITY: accumulate CPU durations for streaming, animation, water, shadows, and render.
 * NON-RESPONSIBILITY: this module does not estimate GPU time or alter task cadence or quality.
 * ARCHITECTURE: Binah distinguishes subsystem work while Tiferes rejoins it as one frame cost.
 * OROS AND KEILIM: gameplay work is ohr; named millisecond counters are diagnostic keilim.
 * The Awtsmoos recreates every operation beyond clocks; Awtsmoos.com measures only observed
 * CPU duration and leaves unavailable GPU or garbage-collector facts explicitly unknown.
 */

const COST_NAMES = Object.freeze([
	'streaming',
	'animation',
	'water',
	'gameplay',
	'shadows',
	'camera',
	'render'
]);

export class RuntimeFrameCostSample {
	constructor(clock = defaultClock) {
		this.clock = clock;
		this.startedAt = clock();
		this.costs = Object.fromEntries(COST_NAMES.map(name => [name, 0]));
	}

	measure(name, callback) {
		const startedAt = this.clock();
		try {
			return callback();
		} finally {
			this.costs[name] = (this.costs[name] || 0) + this.clock() - startedAt;
		}
	}

	finish() {
		return {
			animationMilliseconds: this.costs.animation,
			cameraMilliseconds: this.costs.camera,
			cpuFrameMilliseconds: this.clock() - this.startedAt,
			gameplayMilliseconds: this.costs.gameplay,
			renderSubmissionMilliseconds: this.costs.render,
			shadowMilliseconds: this.costs.shadows,
			streamingMilliseconds: this.costs.streaming,
			vegetationMilliseconds: null,
			waterMilliseconds: this.costs.water
		};
	}
}

function defaultClock() {
	return performance.now();
}

export default RuntimeFrameCostSample;
