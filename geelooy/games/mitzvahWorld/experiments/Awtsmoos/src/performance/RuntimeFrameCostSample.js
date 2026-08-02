// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeFrameCostSample.js
 * @description Reuses one frame-cost vessel while preserving named CPU timing evidence.
 * The Awtsmoos renews the whole pulse beyond clocks; Awtsmoos.com keeps every measured
 * subsystem, animation family, frame total, reset, compatibility measure, and receipt stable.
 */

const COST_NAMES = Object.freeze([
	'streaming',
	'animation',
	'animationDoors',
	'animationWorldModels',
	'animationNpcs',
	'animationHostiles',
	'animationHorses',
	'animationPlayerPose',
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
		this.costs = Object.fromEntries(COST_NAMES.map(name => [name, 0]));
		this.animationBreakdown = createAnimationBreakdown();
		this.receipt = createReceipt(this.animationBreakdown);
		this.reset();
	}

	reset(startedAt = this.clock()) {
		this.startedAt = startedAt;
		for (const name of COST_NAMES) this.costs[name] = 0;
		return this;
	}

	begin() {
		return this.clock();
	}

	end(name, startedAt) {
		this.costs[name] += this.clock() - startedAt;
	}

	measure(name, callback) {
		const startedAt = this.begin();
		try {
			return callback();
		} finally {
			this.end(name, startedAt);
		}
	}

	finish(finishedAt = this.clock()) {
		projectAnimation(this.animationBreakdown, this.costs);
		projectReceipt(this.receipt, this.costs, finishedAt - this.startedAt);
		return this.receipt;
	}
}

function createAnimationBreakdown() {
	return {
		doorsMilliseconds: 0,
		horsesMilliseconds: 0,
		npcsMilliseconds: 0,
		playerMatrixMilliseconds: 0,
		worldModelsMilliseconds: 0
	};
}

function createReceipt(animationBreakdown) {
	return {
		animationBreakdown,
		animationMilliseconds: 0,
		cameraMilliseconds: 0,
		cpuFrameMilliseconds: 0,
		gameplayMilliseconds: 0,
		renderSubmissionMilliseconds: 0,
		shadowMilliseconds: 0,
		streamingMilliseconds: 0,
		vegetationMilliseconds: null,
		waterMilliseconds: 0
	};
}

function projectAnimation(target, costs) {
	target.doorsMilliseconds = costs.animationDoors;
	target.horsesMilliseconds = costs.animationHorses;
	target.npcsMilliseconds = costs.animationNpcs + costs.animationHostiles;
	target.playerMatrixMilliseconds = costs.animationPlayerMatrix;
	target.worldModelsMilliseconds = costs.animationWorldModels;
}

function projectReceipt(target, costs, total) {
	target.animationMilliseconds = costs.animation;
	target.cameraMilliseconds = costs.camera;
	target.cpuFrameMilliseconds = total;
	target.gameplayMilliseconds = costs.gameplay;
	target.renderSubmissionMilliseconds = costs.render;
	target.shadowMilliseconds = costs.shadows;
	target.streamingMilliseconds = costs.streaming;
	target.waterMilliseconds = costs.water;
}

function defaultClock() {
	return performance.now();
}

export default RuntimeFrameCostSample;
