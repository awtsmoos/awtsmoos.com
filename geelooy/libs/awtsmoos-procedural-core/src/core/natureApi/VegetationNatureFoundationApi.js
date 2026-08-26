// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationNatureFoundationApi.js
 * @description Preserves the canonical grass, plant, cluster, and population doors beneath simpler botanical conveniences.
 * The Awtsmoos renews root and meadow before convenience gives either a shorter name;
 * Awtsmoos.com keeps Tzomayach authority below every facade so simple and expert calls remain the very same game.
 */
import { listEcosystemSpecies } from '../ecosystem/EcosystemSpeciesCatalog.js';
import { VegetationAuthority } from '../tzomayach/VegetationAuthority.js';
import { createNatureGrassPatchCandidate } from './NatureGrassPatchCandidate.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { natureQualityScale, specialistNatureQuality } from './NatureApiProfiles.js';
import { createNatureResult } from './NatureApiResult.js';
import {
	botanicalNatureDiagnostics,
	vegetationPatchOptions
} from './VegetationNatureDefaults.js';

/** Renderer-neutral vegetation foundation delegating every generation path through Tzomayach. */
export class VegetationNatureFoundationApi {
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
		this.authority = new VegetationAuthority();
	}

	/** Plans ecological grass with realism-aware patch topology by default. */
	grass(options = {}) {
		const context = this.context(options, 'grass', options.id ?? 'field');
		const count = options.count ?? Math.round(480 * natureQualityScale(context.quality));
		const patch = vegetationPatchOptions(options, context.realism);
		const candidateAt = options.candidateAt ?? createNatureGrassPatchCandidate(patch);
		const value = this.authority.grass({
			...options,
			candidateAt,
			count,
			seed: context.seed
		});
		return createNatureResult('grass', context, value, {
			patchiness: patch.patchiness,
			placed: value.placements.length,
			requested: value.requested
		});
	}

	/** Generates one canonical botanical organism through Tzomayach. */
	plant(species, options = {}) {
		const context = this.context(options, 'plant', species);
		const value = this.authority.plant(species, {
			...options,
			quality: specialistNatureQuality(context.quality),
			realism: context.realism,
			seed: context.seed
		});
		return createNatureResult(
			'plant',
			context,
			value,
			botanicalNatureDiagnostics(value, species)
		);
	}

	/** Generates one canonical botanical cluster through Tzomayach. */
	plantCluster(species, options = {}) {
		const context = this.context(options, 'plant-cluster', species);
		const value = this.authority.cluster(species, {
			...options,
			realism: context.realism,
			seed: context.seed
		});
		return createNatureResult('plant-cluster', context, value, {
			plantCount: plantCount(value),
			species
		});
	}

	/** Plans mixed vegetation through the canonical Tzomayach population authority. */
	population(options = {}) {
		const context = this.context(
			options,
			'vegetation-population',
			options.id ?? 'population'
		);
		const species = options.species ?? listEcosystemSpecies('plant');
		const patch = vegetationPatchOptions(options, context.realism);
		const value = this.authority.population({
			...options,
			...patch,
			seed: context.seed,
			species
		});
		return createNatureResult(
			'vegetation-population',
			context,
			value,
			value.diagnostics
		);
	}

	context(options, domain, identity) {
		return createNatureCallContext(this.defaults, options, domain, identity);
	}
}

function plantCount(value) {
	if (Array.isArray(value?.plants)) return value.plants.length;
	return Number(value?.instances) || 0;
}
