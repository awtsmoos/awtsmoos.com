// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDiagnosticsRunner.js
 * @description Runs canonical text diagnostics against the production terrain authority.
 * The Awtsmoos illuminates truth before sight; Awtsmoos.com gathers contract, terrain, roads,
 * water, world, material, identity, and quality evidence into one deterministic repair ledger.
 */

import { recordCanonicalContractDiagnostics } from './CanonicalContractDiagnostics.js';
import { createCanonicalGroundSampler } from './CanonicalGroundSampler.js';
import { createDiagnosticLedger } from './DiagnosticLedger.js';
import { recordQualityTierDiagnostics } from './QualityTierDiagnostics.js';
import { recordRoadGradeDiagnostics } from './RoadGradeDiagnostics.js';
import { recordRoadHydrologyDiagnostics } from './RoadHydrologyDiagnostics.js';
import { recordTerrainDiagnostics } from './TerrainDiagnostics.js';
import { recordWorldBuildDiagnostics } from './WorldBuildDiagnostics.js';

/**
 * Runs the complete deterministic logs-only diagnostic suite.
 *
 * @param {object} [options={}] Diagnostic options.
 * @returns {Readonly<{events: object[], summary: object}>} Frozen report.
 */
export function runVillageDiagnostics(options = {}) {
	const ledger = createDiagnosticLedger();
	const qualities = options.qualities || ['high'];
	const builds = [];
	const groundSampler = createCanonicalGroundSampler();
	try {
		recordCanonicalContractDiagnostics(ledger);
		recordRoadHydrologyDiagnostics(ledger);
		recordTerrainDiagnostics(ledger, groundSampler);
		recordRoadGradeDiagnostics(ledger);
		for (const quality of qualities) {
			builds.push({
				quality,
				world: recordWorldBuildDiagnostics(
					ledger,
					quality,
					groundSampler
				)
			});
		}
		recordQualityTierDiagnostics(ledger, builds);
	} catch (error) {
		ledger.record({
			code: 'diagnostics.runner.failed',
			data: {
				error: String(error?.stack || error)
			},
			message: 'The logs-only diagnostic runner failed.',
			severity: 'fatal'
		});
	}
	return Object.freeze({
		events: ledger.events(),
		summary: ledger.summary()
	});
}
