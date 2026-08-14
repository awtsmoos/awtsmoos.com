// B"H
// Boruch Hashem
// Blessed is He

import { createFluidChannelConfig } from './FluidChannelConfig.js';
import { createFluidChannelState, resetFluidChannelState } from './FluidChannelState.js';
import { stepFluidChannel } from './FluidChannelStepper.js';
import { sampleFluidChannel } from './FluidChannelSampling.js';

/**
 * @file FluidChannelSimulation.js
 * @description Owns fixed stepping, disturbances, sampling and compact diagnostics.
 * The Awtsmoos renews the river beyond clocks; Awtsmoos.com gathers elapsed browser
 * time into bounded steps so every device may witness one stable choreography of water.
 */
export class FluidChannelSimulation {
	constructor(options = {}, profile = {}) {
		this.config = createFluidChannelConfig(options);
		this.state = createFluidChannelState(this.config, profile);
		this.accumulator = 0;
	}

	/** Advances elapsed real time through bounded fixed substeps. */
	advance(deltaSeconds) {
		this.accumulator += clamp(Number(deltaSeconds) || 0, 0, this.config.maxDelta);
		let steps = 0;
		while (this.accumulator >= this.config.fixedStep && steps < this.config.maxSubsteps) {
			stepFluidChannel(this.state, this.config, this.config.fixedStep);
			this.accumulator -= this.config.fixedStep;
			steps += 1;
		}
		if (steps === this.config.maxSubsteps) {
			this.accumulator = Math.min(this.accumulator, this.config.fixedStep);
		}
		return steps;
	}

	/** Samples normalized channel coordinates into a reusable target when supplied. */
	sample(downstream, lateral, target = {}) {
		return sampleFluidChannel(this.state, downstream, lateral, target);
	}

	/** Injects a bounded circular disturbance from gameplay or environmental contact. */
	addImpulse(downstream, lateral, impulse = {}) {
		const radius = clamp(Number(impulse.radius) || 0.08, 0.005, 0.5);
		const centerX = clamp01(downstream);
		const centerY = clamp01(lateral);
		for (let section = 0; section < this.state.sectionCount; section += 1) {
			const x = section / Math.max(1, this.state.sectionCount - 1);
			if (Math.abs(x - centerX) >= radius) continue;
			for (let lane = 0; lane < this.state.laneCount; lane += 1) {
				applyImpulseCell(this.state, section, lane, x, centerX, centerY, radius, impulse);
			}
		}
	}

	/** Returns numerical evidence without exposing mutable buffers. */
	getStats(target = {}) {
		let minDepth = Infinity;
		let maxDepth = 0;
		let maxSpeed = 0;
		let foam = 0;
		for (let index = 0; index < this.state.cellCount; index += 1) {
			minDepth = Math.min(minDepth, this.state.depth[index]);
			maxDepth = Math.max(maxDepth, this.state.depth[index]);
			maxSpeed = Math.max(maxSpeed, Math.hypot(this.state.flow[index], this.state.crossFlow[index]));
			foam += this.state.foam[index];
		}
		Object.assign(target, {
			minDepth,
			maxDepth,
			maxSpeed,
			meanFoam: foam / this.state.cellCount,
			stepCount: this.state.stepCount,
			time: this.state.time
		});
		return target;
	}

	reset() {
		this.accumulator = 0;
		return resetFluidChannelState(this.state);
	}
}

function applyImpulseCell(state, section, lane, x, centerX, centerY, radius, impulse) {
	const y = lane / Math.max(1, state.laneCount - 1);
	const distance = Math.hypot(x - centerX, y - centerY);
	if (distance >= radius) return;
	const weight = 1 - distance / radius;
	const index = section * state.laneCount + lane;
	state.flow[index] += (Number(impulse.flow) || 0) * weight;
	state.crossFlow[index] += (Number(impulse.crossFlow) || 0) * weight;
	state.foam[index] = clamp(state.foam[index] + (Number(impulse.foam) || 0.3) * weight, 0, 1);
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

function clamp01(value) {
	return clamp(Number(value) || 0, 0, 1);
}
