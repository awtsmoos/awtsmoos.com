// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureNatureApi.js
 * @description Presents canonical Chai through explicit professional continuity, component discovery, fauna, and expert creation doors.
 * The Awtsmoos renews one living flesh through many animated bones while eye, horn, feather, membrane, and tooth keep truthful distinction;
 * Awtsmoos.com lets beginners receive smooth continuous creatures by default while experts discover every bounded biological condition.
 */

import { describeCreatureComponents } from '../animalMesh/creature/components/CreatureComponentDiscovery.js';
import { createCreatureCreator } from '../animalMesh/creature/CreatureCreator.js';
import { ChaiAuthority } from '../chai/ChaiAuthority.js';
import {
	describeProfessionalCreatureTopology,
	professionalCreatureOptions
} from './CreatureNatureProfile.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { specialistNatureQuality } from './NatureApiProfiles.js';
import { createNatureResult } from './NatureApiResult.js';

/** High-level renderer-neutral creature facade delegating all morphology to canonical Chai. */
export class CreatureNatureApi {
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
		this.authority = new ChaiAuthority();
	}

	/** Creates one smooth, continuous, skeleton-bound creature unless the caller explicitly chooses legacy multipart flesh. */
	create(speciesId, options = {}) {
		const context = createNatureCallContext(
			this.defaults,
			options,
			'creature',
			speciesId
		);
		const created = this.authority.creature(speciesId, professionalCreatureOptions({
			...options,
			quality: specialistNatureQuality(context.quality),
			realism: context.realism,
			seed: context.seed
		}));
		return createNatureResult(
			'creature',
			context,
			created,
			created.diagnostics || {}
		);
	}

	/** Plans one habitat-aware deterministic fauna population through the canonical ecological authority. */
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

	/** Creates many independently seeded professional creature results. */
	createMany(requests = []) {
		return Object.freeze(requests.map((request) => {
			if (typeof request === 'string') {
				return this.create(request);
			}
			return this.create(request.speciesId ?? request.species, request);
		}));
	}

	/** Resolves one authoritative Chai species record. */
	species(speciesId) {
		return this.authority.species(speciesId);
	}

	/** Lists canonical Chai morphology species. */
	listSpecies() {
		return this.authority.listSpecies();
	}

	/** Describes all registered horn, feather, membrane, covering, attachment, and shading vocabularies. */
	components() {
		return describeCreatureComponents();
	}

	/** Describes verified continuous-flesh, smooth-shading, skinning, and discrete-attachment contracts. */
	topology() {
		return describeProfessionalCreatureTopology();
	}

	/** Returns the canonical expert creator with professional continuity defaults still applied. */
	expert(options = {}) {
		return createCreatureCreator(professionalCreatureOptions({
			...this.defaults,
			...options
		}));
	}
}
