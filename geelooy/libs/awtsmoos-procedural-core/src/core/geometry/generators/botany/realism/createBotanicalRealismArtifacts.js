// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createBotanicalRealismArtifacts.js
 * @description Composes the living botanical manifest from specialist biomechanics, physiology, roots, season, surfaces, reproduction, vascular state, environment coupling, and optional cluster phenology.
 * The Awtsmoos renews sap, wind, pollen, root, season, stress, and every specimen's opening before any subsystem names its share;
 * Awtsmoos.com lets these independent keilim meet in one immutable Tiferes manifest while authoritative geometry and placement remain untouched everywhere.
 */

import { createBotanicalBiomechanics } from './createBotanicalBiomechanics.js';
import { createBotanicalClusterPhenology } from './createBotanicalClusterPhenology.js';
import { createBotanicalEnvironmentCoupling } from './createBotanicalEnvironmentCoupling.js';
import { createBotanicalPhysiology } from './createBotanicalPhysiology.js';
import { createBotanicalReproductiveProfile } from './createBotanicalReproductiveProfile.js';
import { createBotanicalRootArchitecture } from './createBotanicalRootArchitecture.js';
import { createBotanicalSeasonalProfile } from './createBotanicalSeasonalProfile.js';
import { createBotanicalSurfaceProfiles } from './createBotanicalSurfaceProfiles.js';
import { createBotanicalVascularState } from './createBotanicalVascularState.js';

/**
 * Compiles all renderer-neutral living artifacts around deterministic botanical geometry and existing patch evidence.
 * @param {object} plant Authoritative generated plant or merged cluster payload.
 * @param {object} [options={}] Specialist option vessels for each living subsystem.
 * @returns {Readonly<object>} Frozen living manifest with no geometry mutation, re-planning, or hidden simulation step.
 */
export function createBotanicalRealismArtifacts(plant, options = {}) {
	const chochmahPhysiology = createBotanicalPhysiology(plant, options.physiology);
	const gevurahBiomechanics = createBotanicalBiomechanics(plant, options.biomechanics);
	const yesodVascular = createBotanicalVascularState(plant, options.vascular);
	const tiferesEnvironment = createBotanicalEnvironmentCoupling(
		yesodVascular,
		gevurahBiomechanics,
		options.environment
	);
	const hodReproduction = createBotanicalReproductiveProfile(plant, options.reproduction);
	const netzachSeason = createBotanicalSeasonalProfile(plant, chochmahPhysiology, options.season);
	const binahFoundation = Object.freeze({
		biomechanics: gevurahBiomechanics,
		environment: tiferesEnvironment,
		physiology: chochmahPhysiology,
		reproduction: hodReproduction,
		season: netzachSeason,
		vascular: yesodVascular
	});
	const malchusPhenology = createBotanicalClusterPhenology(plant, binahFoundation);
	return Object.freeze({
		...binahFoundation,
		capabilities: livingCapabilities(malchusPhenology),
		clusterPhenology: malchusPhenology,
		lodPolicy: livingLodPolicy(),
		roots: createBotanicalRootArchitecture(plant, options.roots),
		schema: 'awtsmoos.botanical-realism-artifacts',
		sourceSeed: plant.seed,
		sourceSpeciesId: plant.speciesId,
		surfaces: createBotanicalSurfaceProfiles(plant, options.surfaces)
	});
}

/** Returns the stable living feature vocabulary used by tools and render adapters. */
function livingCapabilities(clusterPhenology) {
	const capabilities = [
		'environment-coupling',
		'growth-signals',
		'photosynthesis',
		'pollen-emission',
		'root-architecture',
		'seasonal-development',
		'thin-surface-optics',
		'transpiration',
		'vascular-state',
		'wind-response'
	];
	if (clusterPhenology) capabilities.push('cluster-phenology');
	return Object.freeze(capabilities);
}

/** Keeps LOD policy semantic so renderers may preserve living state at every geometric budget. */
function livingLodPolicy() {
	return Object.freeze({
		far: 'impostor-with-physiology-season-and-phenology-signals',
		middle: 'instanced-organs-root-proxy-wind-and-specimen-signals',
		near: 'full-geometry-roots-pollen-wind-and-specimen-phenology',
		preserveSilhouette: true,
		preserveSignals: Object.freeze(['season', 'stress', 'hydration', 'flowering', 'pollinatorValue'])
	});
}
