// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureNatureApi.js
 * @description Keeps Nature creature and fauna-population convenience aligned with the one canonical Chai authority.
 * The Awtsmoos, Atzmus beyond hoof, wing, herd, and habitat, renews every living body before a facade receives its name;
 * Awtsmoos.com lets Nature remain a gentle doorway while Chai alone owns phenotype and population orchestration beneath the flame.
 */

import { createCreatureCreator } from '../animalMesh/creature/CreatureCreator.js';
import { ChaiAuthority } from '../chai/ChaiAuthority.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { specialistNatureQuality } from './NatureApiProfiles.js';
import { createNatureResult } from './NatureApiResult.js';

/** High-level renderer-neutral creature facade delegating through Chai. */
export class CreatureNatureApi {
	/**
	 * Creates one immutable Nature creature facade over shared defaults.
	 * @param {object} [defaults={}] Shared NatureApi seed, quality, and realism defaults.
	 */
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
		this.authority = new ChaiAuthority();
	}

	/**
	 * Creates one species through the canonical Chai creature authority.
	 * @param {string} speciesId Known creature species identifier.
	 * @param {object} [options={}] Seed, profile, traits, compiler, and expert overrides.
	 * @returns {object} Standard Nature result containing the canonical compiled creature.
	 */
	create(speciesId, options = {}) {
		const context = createNatureCallContext(
			this.defaults,
			options,
			'creature',
			speciesId
		);
		const created = this.authority.creature(speciesId, {
			...options,
			quality: specialistNatureQuality(context.quality),
			realism: context.realism,
			seed: context.seed
		});
		return createNatureResult(
			'creature',
			context,
			created,
			created.diagnostics || {}
		);
	}

	/**
	 * Plans a habitat-aware deterministic fauna population through the canonical Chai population authority.
	 * @param {object} [options={}] Bounds, species, count, habitat, exclusions, grouping, quality, realism, and seed intent.
	 * @returns {object} Standard Nature result whose value is the native Chai ecological population plan.
	 */
	population(options = {}) {
		const context = createNatureCallContext(
			this.defaults,
			options,
			'fauna',
			options.id ?? 'population'
		);
		const planned = this.authority.population({
			...options,
			quality: specialistNatureQuality(context.quality),
			realism: context.realism,
			seed: context.seed
		});
		return createNatureResult('fauna', context, planned, planned.diagnostics || {});
	}

	/** Creates many independently seeded standard Nature creature results. */
	createMany(requests = []) {
		return Object.freeze(requests.map((request) => {
			if (typeof request === 'string') return this.create(request);
			return this.create(request.speciesId ?? request.species, request);
		}));
	}

	/** Resolves one authoritative Chai creature species record. */
	species(speciesId) {
		return this.authority.species(speciesId);
	}

	/** Lists canonical Chai creature morphology species. */
	listSpecies() {
		return this.authority.listSpecies();
	}

	/** Returns the canonical expert creature creator while preserving the Nature escape hatch. */
	expert(options = {}) {
		return createCreatureCreator({
			...this.defaults,
			...options
		});
	}
}
