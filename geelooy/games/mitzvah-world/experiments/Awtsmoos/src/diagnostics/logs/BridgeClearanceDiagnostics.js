// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BridgeClearanceDiagnostics.js
 * @description Measures BRIDGE01 deck clearance above canonical river elevation.
 * The Awtsmoos keeps passage and water distinct without severing either; Awtsmoos.com proves
 * the stone deck remains traversable above the modeled source-to-outlet hydrology profile.
 */

import {
	canonicalRiverElevation,
	canonicalRiverTerrainSample
} from '../../world/CanonicalTerrainHydrology.js';

const MINIMUM_CLEARANCE = 2.5;

/**
 * Records bridge-to-water clearance evidence for one quality tier.
 *
 * @param {object} ledger Deterministic diagnostic ledger.
 * @param {string} quality Active quality tier.
 * @param {object[]} definitions Generated world definitions.
 * @returns {void}
 */
export function recordBridgeClearanceDiagnostics(ledger, quality, definitions) {
	const bridge = definitions.find((definition) => {
		return definition.userData?.canonicalId === 'BRIDGE01';
	});
	const measurable = bridge?.position && bridge?.size;
	const underside = measurable
		? bridge.position.y - bridge.size.y / 2
		: NaN;
	const riverSample = measurable
		? canonicalRiverTerrainSample(bridge.position.x, bridge.position.z)
		: null;
	const waterElevation = riverSample
		? canonicalRiverElevation(riverSample.t)
		: NaN;
	const clearance = underside - waterElevation;
	const valid = Number.isFinite(clearance)
		&& clearance >= MINIMUM_CLEARANCE;
	ledger.record({
		code: valid ? 'bridge.clearance.valid' : 'bridge.clearance.invalid',
		data: {
			clearance: rounded(clearance),
			minimum: MINIMUM_CLEARANCE,
			quality,
			underside: rounded(underside),
			waterElevation: rounded(waterElevation)
		},
		message: valid
			? 'BRIDGE01 maintains safe clearance above canonical water.'
			: 'BRIDGE01 does not maintain safe water clearance.',
		severity: valid ? 'info' : 'error'
	});
}

function rounded(value) {
	return Number.isFinite(value) ? Number(value.toFixed(4)) : null;
}
