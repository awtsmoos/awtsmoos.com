// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverReachPlan.js
 * @description Joins canonical path, morphology, equilibrium flow, banks, and habitat into one renderer-neutral river reach plan.
 * The Awtsmoos renews channel and floodplain as one created place; Awtsmoos.com lets this Tiferes-like vessel join flow evidence
 * to world-space form while physics, vegetation, architecture, and rendering keep their own truthful responsibilities and grace.
 */

import { normalizeRiverFlowProfile } from './RiverFlowPlanner.js';
import { createDefaultRiverFlowAssembly } from './RiverDefaultFlowProfile.js';
import { createRiverMorphologyProfile } from './RiverMorphologyProfile.js';
import { createRiverReachFrames, offsetRiverPoint } from './RiverReachFrames.js';
import { createRiverReachPath } from './RiverReachPath.js';
import { createRiverReachRealismAuthority } from './RiverReachRealismAuthority.js';

/** Creates one immutable spatial river plan without creating geometry or mutable simulation state. */
export function createRiverReachPlan(options = {}) {
	const path = createRiverReachPath(options);
	const frames = createRiverReachFrames(path.points);
	const assembly = createDefaultRiverFlowAssembly(options);
	const flow = hasAuthoredFlow(options)
		? normalizeRiverFlowProfile(options.profile, options.sampleAt, options)
		: assembly.profile;
	const morphology = hasAuthoredFlow(options)
		? createRiverMorphologyProfile(options)
		: assembly.morphology;
	const reachAuthority = options.reaches?.length
		? createRiverReachRealismAuthority(options.reaches)
		: null;
	const samples = path.points.map((point, index) => {
		return createReachSample(point, frames[index], flow, morphology, reachAuthority, options);
	});
	return Object.freeze({
		id: path.id,
		path,
		samples: Object.freeze(samples),
		seed: path.seed,
		summary: summarize(samples, path.totalLength)
	});
}

function createReachSample(point, frame, flow, morphology, authority, options) {
	const pool = sampleField(morphology.pool, point.t);
	const riffle = sampleField(morphology.riffle, point.t);
	const bend = sampleField(morphology.bend, point.t);
	const constriction = sampleField(morphology.constriction, point.t);
	const baseWidth = positive(options.baseWidth, 8);
	const width = baseWidth * (1 + pool * 0.18 + bend * 0.08 - constriction * 0.32);
	const base = {
		bankSoftness: unit(0.48 + pool * 0.22 - riffle * 0.12),
		bankWetness: unit(0.5 + pool * 0.28 - riffle * 0.08),
		cascadeEnergy: sampleField(flow.cascade, point.t),
		depth: sampleField(flow.depth, point.t),
		flowSpeed: sampleField(flow.speed, point.t),
		habitat: options.habitat || [],
		width
	};
	const evidence = authority ? authority.sample(point.t, base) : base;
	const halfWidth = positive(evidence.width, width) * 0.5;
	const riparianHalfWidth = Math.max(halfWidth, halfWidth * positive(options.riparianScale, 2.4));
	const floodplainHalfWidth = Math.max(riparianHalfWidth, halfWidth * positive(options.floodplainScale, 4.8));
	return Object.freeze({
		...evidence,
		bend,
		center: point,
		constriction,
		distance: point.distance,
		floodplainHalfWidth,
		frame,
		id: `${point.id}:reach`,
		leftBank: offsetRiverPoint(point, frame, halfWidth),
		poolStrength: evidence.poolStrength ?? pool,
		riffleStrength: evidence.riffleStrength ?? riffle,
		riparianHalfWidth,
		rightBank: offsetRiverPoint(point, frame, -halfWidth),
		t: point.t,
		width: halfWidth * 2
	});
}

function hasAuthoredFlow(options) {
	return typeof options.sampleAt === 'function'
		|| Boolean(options.profile?.depth?.length || options.profile?.speed?.length || options.profile?.cascade?.length);
}

function sampleField(values, progress) {
	if (!values?.length) return 0;
	const position = Math.max(0, Math.min(1, progress)) * (values.length - 1);
	const lower = Math.floor(position);
	const upper = Math.min(values.length - 1, lower + 1);
	const blend = position - lower;
	return values[lower] * (1 - blend) + values[upper] * blend;
}

function summarize(samples, length) {
	const widths = samples.map(sample => sample.width);
	return Object.freeze({
		length,
		maxWidth: Math.max(...widths),
		minWidth: Math.min(...widths),
		sampleCount: samples.length
	});
}

function positive(value, fallback) {
	return Math.max(0.001, Number.isFinite(Number(value)) ? Number(value) : fallback);
}

function unit(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
