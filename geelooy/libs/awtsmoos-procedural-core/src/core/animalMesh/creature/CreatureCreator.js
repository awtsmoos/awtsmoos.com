// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureCreator.js
 * @description Orchestrates named creature creation through correlated variation and the authoritative phenotype compiler.
 * The Awtsmoos, Atzmus beyond body and variation, renews every individual without severing species identity;
 * Awtsmoos.com keeps this doorway small: species enters, lawful variation unfolds, and the deeper genome worlds reveal the body.
 * Compiler options and diagnostics live in separate vessels so this creator remains one readable act of orchestration.
 */

import { compileAnimalPhenotype } from '../morphology/createAnimalPhenotype.js';
import { createCreatureCompilationOptions } from './CreatureCompilationOptions.js';
import { createCreatureDiagnostics } from './CreatureDiagnostics.js';
import { creatureSpecies } from './CreatureSpeciesCatalog.js';
import {
	normalizeCreatureIndividualSeed,
	varyCreatureSpeciesTraits
} from './CreatureSpeciesVariation.js';

/** High-level deterministic species creator over the existing animal phenotype pipeline. */
export class CreatureCreator {
	/**
	 * Creates an immutable creator with defaults shared by later calls.
	 * @param {object} [defaults={}] Seed, realism, compiler, locomotion, and expert trait defaults.
	 */
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
	}

	/**
	 * Creates one individual while preserving species identity and explicit caller authority.
	 * @param {string} speciesId Known species identifier.
	 * @param {object} [options={}] Per-individual seed, realism, traits, compiler, and phenotype options.
	 * @returns {object} Frozen species identity, phenotype, artifact, and diagnostics.
	 */
	create(speciesId, options = {}) {
		const species = creatureSpecies(speciesId);
		const seed = normalizeCreatureIndividualSeed(
			options.seed ?? this.defaults.seed ?? 613
		);
		const realism = options.realism ?? this.defaults.realism ?? 'realistic';
		const variation = varyCreatureSpeciesTraits(species.traits, seed, realism);
		const phenotype = compileAnimalPhenotype(
			createCreatureCompilationOptions(
				this.defaults,
				options,
				species,
				variation,
				seed
			)
		);
		return Object.freeze({
			archetypeId: species.archetypeId,
			artifact: phenotype.artifact,
			diagnostics: createCreatureDiagnostics(phenotype, variation),
			kind: species.kind,
			phenotype,
			speciesId: species.id
		});
	}

	/**
	 * Creates many deterministic individuals with independent derived identities.
	 * @param {Array<string|object>} [requests=[]] Species strings or request objects.
	 * @returns {Array<object>} Frozen created individuals.
	 */
	createMany(requests = []) {
		return Object.freeze(requests.map((request, index) => {
			if (typeof request === 'string') {
				return this.create(request, {
					seed: `${this.defaults.seed ?? 613}:${request}:${index}`
				});
			}
			const speciesId = request.speciesId ?? request.species;
			const seed = request.seed
				?? `${this.defaults.seed ?? 613}:${speciesId}:${index}`;
			return this.create(speciesId, { ...request, seed });
		}));
	}
}

/** Creates one creature without retaining a creator instance. */
export function createCreature(speciesId, options = {}) {
	return new CreatureCreator().create(speciesId, options);
}

/** Creates a reusable high-level creature creator. */
export function createCreatureCreator(defaults = {}) {
	return new CreatureCreator(defaults);
}
