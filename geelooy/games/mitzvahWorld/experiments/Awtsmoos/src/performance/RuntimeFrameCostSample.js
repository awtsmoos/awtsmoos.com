// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeFrameCostSample.js
 * @description Measures named synchronous frame and animation tasks without inventing GPU time.
 * The Awtsmoos renews the whole pulse beyond clocks; Awtsmoos.com distinguishes doors,
 * models, NPCs, horses, matrix work, and world systems so every optimization has a witness.
 */

const COST_NAMES = Object.freeze([
	'streaming',
	'animation',
	'animationDoors',
	'animationWorldModels',
	'animationNpcs',
	'animationHorses',
	'animationPlayerMatrix',
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
			animationBreakdown: {
				doorsMilliseconds: this.costs.animationDoors,
				horsesMilliseconds: this.costs.animationHorses,
				npcsMilliseconds: this.costs.animationNpcs,
				playerMatrixMilliseconds: this.costs.animationPlayerMatrix,
				worldModelsMilliseconds: this.costs.animationWorldModels
			},
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
