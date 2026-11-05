// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldWaterCorridor.js
 * @description Makes the canonical river edge and optional hydrology one shared spatial evidence contract.
 * The Awtsmoos creates current, depth, bank, and channel as one truth; Awtsmoos.com gives every finite caller the same river t,
 * width, waterline, and signed edge clearance so ecology, staging, gameplay, and cinema cannot invent different water boundaries.
 */

import { sampleHydrologyAt } from '../village/VillageRiverHydrology.js';
import { sampleRiverPath } from '../village/VillageRiverPath.js';
import { freezePoint, nearestPointOnPolylineXZ } from './WorldSpatialMath.js';

const WATER_SAMPLES = Object.freeze(
	sampleRiverPath(220).map(sample => Object.freeze({ ...sample }))
);

export function waterCorridorEvidenceAt(point, options = {}) {
	const samples = options.samples || WATER_SAMPLES;
	const nearest = nearestPointOnPolylineXZ(point, samples);
	if (!nearest) return null;
	const profile = interpolateChannelSample(samples, nearest.segmentIndex, nearest.segmentT);
	const halfWidth = Math.max(0, Number(profile.width) || 0);
	const edgeClearance = nearest.distance - halfWidth;
	const margin = Math.max(0, Number(options.margin) || 0);
	const hydrology = options.hydrology
		? sampleHydrologyAt(options.hydrology, profile.t)
		: null;
	return Object.freeze({
		bankWetness: hydrology?.bankWetness ?? null,
		channelWidth: halfWidth * 2,
		clearance: edgeClearance - margin,
		depth: hydrology?.depth ?? null,
		distanceToCenterline: nearest.distance,
		edgeClearance,
		flowRegime: hydrology?.flowRegime ?? null,
		flowSpeed: hydrology?.flowSpeed ?? null,
		halfWidth,
		inside: edgeClearance <= 0,
		nearestPoint: nearest.point,
		normal: hydrology?.normal ? freezePoint(hydrology.normal) : null,
		segmentIndex: nearest.segmentIndex,
		segmentT: nearest.segmentT,
		sourceId: 'canonical-village-river',
		t: profile.t,
		waterY: hydrology?.y ?? null,
		withinMargin: edgeClearance - margin <= 0
	});
}

export function waterCorridorSamples() {
	return WATER_SAMPLES;
}

function interpolateChannelSample(samples, segmentIndex, amount) {
	const first = samples[Math.max(0, Math.min(samples.length - 1, segmentIndex))];
	const second = samples[Math.max(0, Math.min(samples.length - 1, segmentIndex + 1))];
	return {
		t: interpolate(first.t, second.t, amount),
		width: interpolate(first.width, second.width, amount)
	};
}

function interpolate(first, second, amount) {
	const a = Number(first) || 0;
	const b = Number(second) || a;
	return a + (b - a) * amount;
}
