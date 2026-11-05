// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverChannelProfile.js
 * @description Derives static channel equilibrium, then applies canonical reach realism before the shared fluid runtime animates it.
 * The Awtsmoos, Atzmus beyond depth and haste, renews one current through pool, narrows, garden bank, lake, and outlet breath;
 * Awtsmoos.com preserves the authored hydraulic baseline while reach policy gives each place more legible water, moisture, habitat, and depth.
 */

import { mainRiverVillageRiverSample } from './MainRiverVillageRiverPolicy.js';
import { RIVER_LAKE_T } from './VillageRiverPath.js';

const MINIMUM_DEPTH = 0.48;
const MAXIMUM_BASE_DEPTH = 2.35;
const MAXIMUM_REALISTIC_DEPTH = 3.25;

/**
 * Resolves one immutable channel description for a sampled river point.
 * @param {number} t Normalized source-to-outlet position.
 * @param {number} width Current reach-aware half-width of visible river surface.
 * @returns {Readonly<object>} Depth, bank moisture, speed, regime, reach, and habitat evidence.
 */
export function riverChannelProfileAt(t, width) {
	const position = clamp(Number(t) || 0, 0, 1);
	const channelWidth = Math.max(1, Number(width) || 1);
	const plungeInfluence = gaussian(position, 0.16, 0.075);
	const narrowInfluence = gaussian(position, 0.42, 0.1);
	const lowerPoolInfluence = gaussian(position, RIVER_LAKE_T, 0.14);
	const baseDepth = clamp(
		0.58
		+ plungeInfluence * 1.42
		+ narrowInfluence * 0.2
		+ lowerPoolInfluence * 0.72
		+ Math.max(0, channelWidth - 3.1) * 0.035,
		MINIMUM_DEPTH,
		MAXIMUM_BASE_DEPTH
	);
	const baseWetness = clamp(
		0.4
		+ plungeInfluence * 0.34
		+ narrowInfluence * 0.16
		+ lowerPoolInfluence * 0.2,
		0.35,
		0.96
	);
	const flowRegime = flowRegimeAt(position);
	const baseFlowSpeed = flowSpeedFor(flowRegime, channelWidth);
	const reach = mainRiverVillageRiverSample(position, {
		bankSoftness: 0.45,
		bankWetness: baseWetness,
		depth: baseDepth,
		flowSpeed: baseFlowSpeed
	});
	return Object.freeze({
		bankSoftness: reach.bankSoftness,
		bankWetness: reach.bankWetness,
		depth: clamp(reach.depth, MINIMUM_DEPTH, MAXIMUM_REALISTIC_DEPTH),
		flowRegime,
		flowSpeed: clamp(reach.flowSpeed, 0.14, 1.45),
		habitat: reach.habitat,
		poolStrength: reach.poolStrength,
		reachId: reach.reachId,
		riffleStrength: reach.riffleStrength
	});
}

function flowRegimeAt(position) {
	if (position < 0.09) return 'mountain-source';
	if (position < 0.25) return 'plunge-pool';
	if (position < 0.5) return 'fast-narrows';
	if (position < RIVER_LAKE_T - 0.06) return 'village-current';
	if (position < RIVER_LAKE_T + 0.14) return 'calm-lower-pool';
	return 'outlet-run';
}

function flowSpeedFor(regime, width) {
	const regimeSpeed = {
		'calm-lower-pool': 0.34,
		'fast-narrows': 1.18,
		'mountain-source': 0.82,
		'outlet-run': 0.62,
		'plunge-pool': 0.76,
		'village-current': 0.88
	}[regime];
	return clamp(
		regimeSpeed * (4.2 / Math.max(3.1, width)),
		0.18,
		1.35
	);
}

function gaussian(value, center, radius) {
	const normalized = (value - center) / radius;
	return Math.exp(-(normalized * normalized));
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
