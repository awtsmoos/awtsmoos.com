// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationNatureApi.js
 * @description Keeps Nature vegetation convenience calls aligned with the one canonical Tzomayach authority.
 * The Awtsmoos, Atzmus beyond root and species, reveals one soil as meadow, reed, shrub, bloom, and grove;
 * Awtsmoos.com lets Nature translate realism and budget while Tzomayach alone directs grass, botany, and population growth.
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

/** High-level renderer-neutral vegetation facade delegating through Tzomayach. */
export class VegetationNatureApi {
	/** @param {object} [defaults={}] Shared NatureApi defaults. */
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
		this.authority = new VegetationAuthority();
	}

	/** Plans ecological grass with realism-aware patch topology by default. */
	grass(options = {}) {
		const context = this.context(options, 'grass', options.id ?? 'field');
		const count = options.count ?? Math.round(480 * natureQualityScale(context.quality));
		const patch = vegetationPatchOptions(options, context.realism);
		const candidateAt = options.candidateAt
			?? createNatureGrassPatchCandidate(patch);
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
			plantCount: value.plants?.length ?? value.instances?.length ?? 0,
			species
		});
	}

	/** Plans mixed vegetation through the canonical Tzomayach population authority. */
	population(options = {}) {
		const context = this.context(options, 'vegetation-population', options.id ?? 'population');
		const species = options.species ?? listEcosystemSpecies('plant');
		const patch = vegetationPatchOptions(options, context.realism);
		const value = this.authority.population({
			...options,
			...patch,
			seed: context.seed,
			species
		});
		return createNatureResult('vegetation-population', context, value, value.diagnostics);
	}

	context(options, domain, identity) {
		return createNatureCallContext(this.defaults, options, domain, identity);
	}
}
