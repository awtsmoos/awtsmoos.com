// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverReachSample.js
 * @description Joins path frame, flow, morphology, and optional reach realism into one immutable spatial river sample.
 * The Awtsmoos renews depth, width, bend, and bank as one created moment; Awtsmoos.com lets this Tiferes-like sample
 * carry their agreement without becoming a mesh, a solver, or a renderer, so later worlds may drink from one protected well.
 */

import { offsetRiverPoint } from './RiverReachFrames.js';

/** Creates one immutable river-reach sample at a canonical path point. */
export function createRiverReachSample(point, frame, flow, morphology, authority, options = {}) {
	const pool = sampleRiverSeries(morphology.pool, point.t);
	const riffle = sampleRiverSeries(morphology.riffle, point.t);
	const bend = sampleRiverSeries(morphology.bend, point.t);
	const constriction = sampleRiverSeries(morphology.constriction, point.t);
	const baseWidth = positive(options.baseWidth, 8);
	const width = baseWidth * Math.max(0.12, 1 + pool * 0.18 + bend * 0.08 - constriction * 0.32);
	const base = Object.freeze({
		bankSoftness: unit(0.48 + pool * 0.22 - riffle * 0.12),
		bankWetness: unit(0.5 + pool * 0.28 - riffle * 0.08),
		cascadeEnergy: sampleRiverSeries(flow.cascade, point.t),
		depth: positive(sampleRiverSeries(flow.depth, point.t), 0.04),
		flowSpeed: nonnegative(sampleRiverSeries(flow.speed, point.t), 0),
		habitat: freezeHabitat(options.habitat),
		width
	});
	const evidence = authority ? authority.sample(point.t, base) : base;
	const finalWidth = positive(evidence.width, width);
	const halfWidth = finalWidth * 0.5;
	return Object.freeze({
		...evidence,
		bend,
		center: point,
		constriction,
		distance: point.distance,
		frame,
		habitat: freezeHabitat(evidence.habitat),
		id: `${point.id}:reach`,
		leftBank: offsetRiverPoint(point, frame, halfWidth),
		poolStrength: evidence.poolStrength ?? pool,
		riffleStrength: evidence.riffleStrength ?? riffle,
		rightBank: offsetRiverPoint(point, frame, -halfWidth),
		t: point.t,
		width: finalWidth
	});
}

/** Linearly samples a finite numeric series by normalized progress. */
export function sampleRiverSeries(values, progress) {
	if (!values?.length) return 0;
	const position = unit(progress) * (values.length - 1);
	const lower = Math.floor(position);
	const upper = Math.min(values.length - 1, lower + 1);
	const blend = position - lower;
	return finite(values[lower], 0) * (1 - blend) + finite(values[upper], 0) * blend;
}

function freezeHabitat(value) {
	return Object.freeze(Array.isArray(value) ? [...value] : []);
}

function positive(value, fallback) {
	return Math.max(0.001, finite(value, fallback));
}

function nonnegative(value, fallback) {
	return Math.max(0, finite(value, fallback));
}

function unit(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
