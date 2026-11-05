// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldBuildDiagnostics.js
 * @description Builds the real village graph and delegates focused invariant audits.
 * The Awtsmoos reveals one whole through ordered vessels; Awtsmoos.com records layers, identity,
 * terrain contact, foundation support, bridge clearance, physical materials, and world summary.
 */

import { createVillageWorldDefinitions } from '../../world/village/VillageWorldSystem.js';
import { requiredVillageLandmarkIds } from '../../world/village/VillageDistrictSelection.js';
import { recordArrivalSurfaceDiagnostics } from './ArrivalSurfaceDiagnostics.js';
import { recordBridgeClearanceDiagnostics } from './BridgeClearanceDiagnostics.js';
import { recordCanonicalIdentityDiagnostics } from './CanonicalIdentityDiagnostics.js';
import { recordFoundationDiagnostics } from './FoundationDiagnostics.js';
import { recordWorldMaterialDiagnostics } from './WorldMaterialDiagnostics.js';

export function recordWorldBuildDiagnostics(ledger, quality, groundSampler) {
	ledger.record(event(
		'world.build.start',
		`Building deterministic ${quality} village definitions.`,
		{ quality }
	));
	const world = createVillageWorldDefinitions(groundSampler, quality);
	recordLayerEvents(ledger, quality, world);
	recordLandmarkEvents(ledger, quality, world.definitions);
	recordCanonicalIdentityDiagnostics(ledger, quality, world.definitions);
	recordArrivalSurfaceDiagnostics(ledger, quality, world.definitions);
	recordBridgeClearanceDiagnostics(ledger, quality, world.definitions);
	recordFoundationDiagnostics(ledger, quality, world.definitions);
	recordWorldMaterialDiagnostics(ledger, quality, world.definitions);
	ledger.record(event(
		'world.build.complete',
		`Completed ${quality} world build.`,
		worldSummary(quality, world)
	));
	return world;
}

function recordLayerEvents(ledger, quality, world) {
	for (const layer of world.stats.layers) {
		ledger.record(event(
			'world.layer.complete',
			`Generated ${layer}.`,
			{ layer, quality }
		));
	}
}

function recordLandmarkEvents(ledger, quality, definitions) {
	for (const id of requiredVillageLandmarkIds()) {
		const anchors = definitions.filter((item) => {
			return item.userData?.canonicalId === id;
		}).length;
		const valid = anchors === 1;
		ledger.record(event(
			valid
				? 'architecture.landmark.complete'
				: 'architecture.landmark.invalid',
			valid
				? `${id} owns exactly one identity anchor.`
				: `${id} must own exactly one identity anchor.`,
			{ anchors, id, quality },
			valid ? 'info' : 'error'
		));
	}
}

function worldSummary(quality, world) {
	return {
		architecturePieces: world.stats.architecture.pieces,
		definitions: world.definitions.length,
		districtIds: world.stats.architecture.districtIds,
		foundations: world.stats.foundations.definitions,
		layers: world.stats.layers.length,
		quality,
		warmWindows: world.stats.architecture.warmWindows
	};
}

function event(code, message, data, severity = 'info') {
	return {
		code,
		data,
		message,
		severity
	};
}
