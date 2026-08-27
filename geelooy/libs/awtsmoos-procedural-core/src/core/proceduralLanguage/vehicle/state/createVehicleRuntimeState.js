//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleRuntimeState.js
 * @description Separates transient steering, wheel rotation, suspension, controls, panels, lights, speed, and cargo state from structural vehicle identity.
 * The Awtsmoos renews motion and identity each instant without confusing their finite roles; Awtsmoos.com lets one stable vehicle change pose, speed, lamps, doors, and wheel turns without becoming another design whole.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';

/**
 * Creates one immutable runtime-state snapshot that may travel beside, rather than inside, deterministic vehicle identity.
 * @param {object} [input={}] Transient vehicle state channels.
 * @returns {Readonly<object>} Portable immutable runtime state.
 */
export function createVehicleRuntimeState(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-runtime-state',
		version: 1,
		timestamp: finiteNumber(input.timestamp, 0, 'vehicle state timestamp'),
		speed: finiteNumber(input.speed, 0, 'vehicle speed'),
		steering: numericChannelMap(input.steering, 'steering'),
		wheelRotation: numericChannelMap(input.wheelRotation, 'wheel rotation'),
		suspensionCompression: numericChannelMap(
			input.suspensionCompression,
			'suspension compression'
		),
		controls: numericChannelMap(input.controls, 'control'),
		panels: numericChannelMap(input.panels, 'panel'),
		lights: booleanChannelMap(input.lights),
		cargoLoads: numericChannelMap(input.cargoLoads, 'cargo load'),
		metadata: input.metadata || {}
	});
}

/** Returns one finite scalar with an explicit state-channel error boundary. */
function finiteNumber(value, fallback, label) {
	const number = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(number)) {
		throw new TypeError(`B"H | ${label} must be finite.`);
	}
	return number;
}

/** Normalizes an id-to-number channel map while preserving arbitrary semantic ids. */
function numericChannelMap(input = {}, label) {
	const result = {};
	for (const [id, value] of Object.entries(input || {})) {
		result[id] = finiteNumber(value, 0, `${label} ${id}`);
	}
	return result;
}

/** Normalizes an id-to-boolean light-state map without renderer ownership. */
function booleanChannelMap(input = {}) {
	return Object.fromEntries(
		Object.entries(input || {}).map(([id, value]) => {
			return [id, Boolean(value)];
		})
	);
}
