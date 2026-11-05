// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainDiagnostics.js
 * @description Audits terrain resolution and proves diagnostics use the production height field.
 * The Awtsmoos grants every slope one measure; Awtsmoos.com verifies that valley sampling,
 * world construction, collision reasoning, roads, farms, and foundations share canonical ground.
 */

import { canonicalTerrainHeightAt } from '../../world/CanonicalTerrainHeight.js';
import {
	DEFAULT_TERRAIN_SIZE,
	DEFAULT_TERRAIN_STEPS,
	terrainCoordinateAt
} from '../../world/TerrainGeometry.js';

const AUTHORITY_POINTS = Object.freeze([
	Object.freeze({ x: -110, z: -80 }),
	Object.freeze({ x: 0, z: 0 }),
	Object.freeze({ x: 75, z: 52 }),
	Object.freeze({ x: 138, z: -22 })
]);

/**
 * Records sampling-density and canonical-authority invariants.
 *
 * @param {object} ledger Deterministic diagnostic ledger.
 * @param {object} groundSampler Ground sampler supplied to real world builders.
 * @returns {void}
 */
export function recordTerrainDiagnostics(ledger, groundSampler) {
	recordResolutionDiagnostic(ledger);
	recordAuthorityDiagnostic(ledger, groundSampler);
}

function recordResolutionDiagnostic(ledger) {
	const half = DEFAULT_TERRAIN_SIZE / 2;
	const midpoint = DEFAULT_TERRAIN_STEPS / 2;
	const center = terrainCoordinateAt(midpoint, DEFAULT_TERRAIN_STEPS, half);
	const nearCenter = terrainCoordinateAt(midpoint + 1, DEFAULT_TERRAIN_STEPS, half);
	const nearEdge = terrainCoordinateAt(DEFAULT_TERRAIN_STEPS - 1, DEFAULT_TERRAIN_STEPS, half);
	const edge = terrainCoordinateAt(DEFAULT_TERRAIN_STEPS, DEFAULT_TERRAIN_STEPS, half);
	const centerSpacing = nearCenter - center;
	const edgeSpacing = edge - nearEdge;
	const valid = DEFAULT_TERRAIN_STEPS >= 128
		&& centerSpacing > 0
		&& centerSpacing < edgeSpacing
		&& centerSpacing <= 2;
	ledger.record({
		code: valid ? 'terrain.resolution.valid' : 'terrain.resolution.invalid',
		data: {
			centerSpacing: rounded(centerSpacing),
			edgeSpacing: rounded(edgeSpacing),
			size: DEFAULT_TERRAIN_SIZE,
			steps: DEFAULT_TERRAIN_STEPS
		},
		message: valid
			? 'Terrain sampling is concentrated inside the inhabited valley.'
			: 'Terrain resolution is insufficient or incorrectly distributed.',
		severity: valid ? 'info' : 'error'
	});
}

function recordAuthorityDiagnostic(ledger, groundSampler) {
	const differences = AUTHORITY_POINTS.map(({ x, z }) => {
		const sampled = groundSampler.sample(x, z).height;
		const canonical = canonicalTerrainHeightAt(x, z);
		return Math.abs(sampled - canonical);
	});
	const maximumDifference = Math.max(...differences);
	const valid = maximumDifference <= Number.EPSILON;
	ledger.record({
		code: valid ? 'terrain.authority.valid' : 'terrain.authority.invalid',
		data: {
			maximumDifference: rounded(maximumDifference),
			samples: AUTHORITY_POINTS.length
		},
		message: valid
			? 'Diagnostics and production builders share canonical terrain height.'
			: 'Diagnostics are using a different terrain authority.',
		severity: valid ? 'info' : 'fatal'
	});
}

function rounded(value) {
	return Number(value.toFixed(6));
}
