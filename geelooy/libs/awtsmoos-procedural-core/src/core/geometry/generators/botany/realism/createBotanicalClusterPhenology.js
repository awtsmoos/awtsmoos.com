// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createBotanicalClusterPhenology.js
 * @description Derives specimen-level flowering, nectar, pollinator value, stress, and senescence from existing immutable patch ecology plus cluster-wide living signals.
 * The Awtsmoos renews each blossom's maturity, crowding, opening, season, and hidden sweetness before a bee can choose its path;
 * Awtsmoos.com lets those already-known truths become one phenological witness without spending another random number or moving one stem from its place.
 */

import { summarizeBotanicalClusterPhenology } from './summarizeBotanicalClusterPhenology.js';

/**
 * Creates immutable per-specimen phenology from an authoritative cluster and its living artifacts.
 * @param {object} cluster Botanical cluster carrying frozen `placements` from the authoritative patch plan.
 * @param {object} artifacts Cluster-wide living realism artifacts.
 * @returns {Readonly<object>|null} Frozen cluster phenology, or null when no placement evidence exists.
 */
export function createBotanicalClusterPhenology(cluster, artifacts) {
	if (!Array.isArray(cluster.placements)) return null;
	const specimens = Object.freeze(cluster.placements.map(placement => {
		return specimenPhenology(placement, artifacts);
	}));
	return Object.freeze({
		schema: 'awtsmoos.botanical-cluster-phenology',
		sourceSeed: cluster.seed,
		sourceSpeciesId: cluster.speciesId,
		specimens,
		summary: summarizeBotanicalClusterPhenology(specimens)
	});
}

/**
 * Converts one existing placement ecology record into developmental and pollinator-facing signals.
 * @param {object} placement Frozen authoritative patch placement.
 * @param {object} artifacts Cluster-wide living manifest foundation.
 * @returns {Readonly<object>} Frozen specimen phenology that retains source placement identity.
 */
function specimenPhenology(placement, artifacts) {
	const ecology = placement.ecology || {};
	const maturity = unit(ecology.maturity, 0.5);
	const competition = unit(ecology.competition, 0);
	const opening = unit(ecology.openingExposure, 1);
	const edge = unit(ecology.edgeExposure, 0);
	const habitat = unit(placement.environmentScore, 1);
	const floweringSeason = unit(artifacts.season?.development?.flowering, 0);
	const senescenceSeason = unit(artifacts.season?.development?.senescence, 0);
	const nectar = unit(artifacts.reproduction?.pollination?.nectar, 0);
	const globalStress = environmentStress(artifacts.environment);
	const stress = unit(
		globalStress * 0.48
		+ competition * 0.3
		+ (1 - habitat) * 0.22,
		0
	);
	const flowering = unit(
		floweringSeason
		* maturity
		* (0.58 + opening * 0.42)
		* (1 - competition * 0.36)
		* (1 - stress * 0.32),
		0
	);
	const nectarPotential = unit(nectar * flowering * (0.62 + opening * 0.38), 0);
	const pollinatorValue = unit(nectarPotential * (0.72 + edge * 0.28), 0);
	const senescence = unit(
		senescenceSeason * (0.78 + maturity * 0.12 + edge * 0.1)
		+ stress * 0.16,
		0
	);
	return Object.freeze({
		competition,
		edgeExposure: edge,
		flowering,
		habitat,
		id: placement.id,
		maturity,
		nectarPotential,
		openingExposure: opening,
		pollinatorValue,
		position: placement.position,
		scale: placement.scale,
		seed: placement.seed,
		senescence,
		stress,
		yaw: placement.yaw
	});
}

/** Reduces global vascular/environment stress into one bounded phenology pressure. */
function environmentStress(environment = {}) {
	const stress = environment.stress || {};
	return unit(
		unit(stress.waterStress, 0) * 0.45
		+ unit(stress.wilting, 0) * 0.35
		+ unit(stress.mechanicalFragility, 0) * 0.2,
		0
	);
}

/** Returns one bounded unit scalar with a finite fallback. */
function unit(value, fallback) {
	const number = Number(value);
	const finite = Number.isFinite(number) ? number : fallback;
	return Math.max(0, Math.min(1, finite));
}
