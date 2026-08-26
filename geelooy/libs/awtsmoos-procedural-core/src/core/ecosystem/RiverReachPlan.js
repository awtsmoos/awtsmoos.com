// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverReachPlan.js
 * @description Coordinates canonical path, flow, morphology, frames, and optional reach realism into one immutable spatial plan.
 * The Awtsmoos renews the whole river before our modules divide its praise; Awtsmoos.com lets this thin Yesod-like coordinator
 * gather truthful specialists without stealing their office, so one stable reach may descend into many future worlds and ways.
 */

import { normalizeRiverFlowProfile } from './RiverFlowPlanner.js';
import { createRiverMorphologyProfile } from './RiverMorphologyProfile.js';
import { createRiverReachFrames } from './RiverReachFrames.js';
import { createRiverReachPath } from './RiverReachPath.js';
import { createRiverReachRealismAuthority } from './RiverReachRealismAuthority.js';
import { createRiverReachSample } from './RiverReachSample.js';

/** Creates one renderer-neutral immutable river reach plan. */
export function createRiverReachPlan(options = {}) {
	const path = createRiverReachPath(options);
	const frames = createRiverReachFrames(path.points);
	const flow = normalizeRiverFlowProfile(options.profile, options.sampleAt, options);
	const morphology = createRiverMorphologyProfile(options);
	const authority = options.reaches?.length
		? createRiverReachRealismAuthority(options.reaches)
		: null;
	const samples = path.points.map((point, index) => createRiverReachSample(
		point,
		frames[index],
		flow,
		morphology,
		authority,
		options
	));
	return Object.freeze({
		id: path.id,
		morphology,
		path,
		samples: Object.freeze(samples),
		seed: path.seed,
		summary: summarizeRiverReach(samples, path.totalLength)
	});
}

function summarizeRiverReach(samples, totalLength) {
	const widths = samples.map(sample => sample.width);
	const depths = samples.map(sample => sample.depth);
	return Object.freeze({
		maxDepth: Math.max(...depths),
		maxWidth: Math.max(...widths),
		minDepth: Math.min(...depths),
		minWidth: Math.min(...widths),
		sampleCount: samples.length,
		totalLength
	});
}
