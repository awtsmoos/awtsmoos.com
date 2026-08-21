// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverFlowPlanner.js
 * @description Converts authored samples, explicit arrays, or finite defaults into one shared bounded river runtime.
 * The Awtsmoos, Atzmus beyond every bank, renews authored form and emergent motion without making them rivals;
 * Awtsmoos.com lets this Yesod planner connect profile intent to FluidChannelSimulation while each keeps its truthful office.
 * No geometry is generated here; this module owns only profile selection and simulation construction.
 */

import { FluidChannelSimulation } from '../physics/fluid/FluidChannelSimulation.js';
import {
	createDefaultRiverFlowProfile,
	normalizeRiverFlowProfileArrays,
	sampleRiverFlowProfile
} from './RiverFlowProfile.js';
import { RiverFlowRuntime } from './RiverFlowRuntime.js';

/**
 * Creates one bounded mutable river runtime from authored or generated equilibrium evidence.
 * @param {object} [options={}] Profile, sample callback, physical solver, and quality options.
 * @returns {RiverFlowRuntime} Explicit river lifecycle facade over FluidChannelSimulation.
 */
export function createRiverFlowRuntime(options = {}) {
	const profile = normalizeRiverFlowProfile(
		options.profile,
		options.sampleAt,
		options
	);
	const simulation = new FluidChannelSimulation(
		fluidOptions(options),
		profile
	);
	return Object.freeze(new RiverFlowRuntime(simulation, profile));
}

/**
 * Produces a complete finite profile from authored samples, arrays, or physically populated defaults.
 * @param {object} [profile={}] Optional explicit profile arrays.
 * @param {Function|null} [sampleAt=null] Optional normalized authored river sampler.
 * @param {object|number} [options={}] Profile/default options or legacy sample-count number.
 * @returns {{depth:Array<number>,speed:Array<number>,cascade:Array<number>}} Frozen complete profile.
 */
export function normalizeRiverFlowProfile(profile = {}, sampleAt = null, options = {}) {
	const normalizedOptions = typeof options === 'number'
		? { profileSamples: options }
		: options;
	if (typeof sampleAt === 'function') {
		return sampleRiverFlowProfile(
			sampleAt,
			normalizedOptions.profileSamples
		);
	}
	if (hasProfileValues(profile)) {
		return normalizeRiverFlowProfileArrays(profile, normalizedOptions);
	}
	return createDefaultRiverFlowProfile(normalizedOptions);
}

function hasProfileValues(profile) {
	return Boolean(
		profile?.depth?.length
		|| profile?.speed?.length
		|| profile?.cascade?.length
	);
}

function fluidOptions(options) {
	return {
		bankDamping: options.bankDamping,
		depthRelaxation: options.depthRelaxation,
		drag: options.drag,
		drive: options.drive,
		fixedStep: options.fixedStep,
		foamDecay: options.foamDecay,
		gravity: options.gravity,
		laneCount: options.laneCount,
		maxDelta: options.maxDelta,
		maxDepthMultiplier: options.maxDepthMultiplier,
		maxSpeed: options.maxSpeed,
		maxSubsteps: options.maxSubsteps,
		minDepth: options.minDepth,
		quality: options.quality || 'low',
		sectionCount: options.sectionCount,
		viscosity: options.viscosity
	};
}
