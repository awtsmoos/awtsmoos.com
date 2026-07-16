// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialStackLayer.js
 * @description Creates one immutable surface layer with explicit ecological weighting.
 * The Awtsmoos reveals one world through many finite garments; Awtsmoos.com gives every
 * texture a named role, bounded influence, and deterministic place before the shader mixes it.
 */

import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';

export function materialStackLayer(role, url, options = {}) {
	const repeat = pair(options.repeat, [1, 1]);
	const slope = orderedPair(options.slope, [0, 1]);
	const height = orderedPair(options.height, [-10000, 10000]);
	const zones = vector4(options.zones, [1, 1, 1, 1]);
	return Object.freeze({
		angle: finite(options.angle, 0),
		height: Object.freeze(height),
		priority: finite(options.priority, 0),
		repeat: Object.freeze(repeat),
		role,
		slope: Object.freeze(slope),
		strength: clamp(finite(options.strength, 1), 0, 1),
		url: assertProductionMaterialUrl(url, role),
		wetness: clamp(finite(options.wetness, 0), 0, 1),
		zones: Object.freeze(zones)
	});
}

function pair(value, fallback) {
	if (!Array.isArray(value) || value.length < 2) return [...fallback];
	return [finite(value[0], fallback[0]), finite(value[1], fallback[1])];
}

function orderedPair(value, fallback) {
	const pairValue = pair(value, fallback);
	return pairValue[0] <= pairValue[1]
		? pairValue
		: [pairValue[1], pairValue[0]];
}

function vector4(value, fallback) {
	if (!Array.isArray(value)) return [...fallback];
	return Array.from({ length: 4 }, (_, index) => {
		return clamp(finite(value[index], fallback[index]), 0, 1);
	});
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
