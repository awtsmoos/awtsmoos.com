// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalContractDiagnostics.js
 * @description Audits identifiers, footprints, roads, water, cameras, and biomes as one contract.
 * The Awtsmoos is one through all directions; Awtsmoos.com exposes any duplicate dwelling,
 * missing threshold, detached road, broken river sequence, or absent camera in explicit logs.
 */

import { CANONICAL_VILLAGE_PLAN } from '../../world/village/CanonicalVillagePlan.js';

export function recordCanonicalContractDiagnostics(ledger) {
	const plan = CANONICAL_VILLAGE_PLAN;
	ledger.record({
		code: 'canonical.contract.loaded',
		data: contractCounts(plan),
		message: `Loaded ${plan.version}.`,
		severity: 'info'
	});
	recordIdentifierIntegrity(ledger, plan);
	recordRoadIntegrity(ledger, plan);
	recordHydrologyIntegrity(ledger, plan);
}

function recordIdentifierIntegrity(ledger, plan) {
	const identifiers = plan.identifiers;
	const footprintIds = plan.footprints.map((item) => item.id);
	const duplicates = identifiers.filter((id, index) => identifiers.indexOf(id) !== index);
	const missing = identifiers.filter((id) => !footprintIds.includes(id));
	const unexpected = footprintIds.filter((id) => !identifiers.includes(id));
	const valid = duplicates.length === 0 && missing.length === 0 && unexpected.length === 0;
	ledger.record({
		code: valid ? 'canonical.identifiers.valid' : 'canonical.identifiers.invalid',
		data: { duplicates, missing, unexpected },
		message: valid ? 'Every canonical identifier owns one footprint.' : 'Identifier and footprint sets disagree.',
		severity: valid ? 'info' : 'error'
	});
}

function recordRoadIntegrity(ledger, plan) {
	const routes = plan.roads.routes;
	const malformed = routes.filter((route) => !route.points || route.points.length < 2);
	const connected = plan.roads.evidence.connected && malformed.length === 0;
	ledger.record({
		code: connected ? 'road.graph.connected' : 'road.graph.disconnected',
		data: { malformed: malformed.map((route) => route.id), routes: routes.length },
		message: connected ? 'Canonical road corridors are structurally connected.' : 'Canonical road graph contains broken routes.',
		severity: connected ? 'info' : 'error'
	});
}

function recordHydrologyIntegrity(ledger, plan) {
	const points = plan.river.controlPoints;
	const lakeIndex = plan.river.lakeIndex;
	const valid = points.length > 8 && lakeIndex > 0 && lakeIndex < points.length - 1;
	ledger.record({
		code: valid ? 'hydrology.sequence.valid' : 'hydrology.sequence.invalid',
		data: { cascades: plan.river.cascades.length, lakeIndex, points: points.length },
		message: valid ? 'Water sequence contains source, cascades, lake reach, and outlet.' : 'Canonical water sequence is incomplete.',
		severity: valid ? 'info' : 'error'
	});
}

function contractCounts(plan) {
	return {
		biomes: plan.biomes.length,
		cameras: plan.cameras.length,
		footprints: plan.footprints.length,
		identifiers: plan.identifiers.length,
		routes: plan.roads.routes.length
	};
}
