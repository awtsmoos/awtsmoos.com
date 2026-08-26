//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file CreatureCreator.js
 * @description Orchestrates named creature creation through correlated species variation, lawful individual biology, surface intent, and the authoritative phenotype compiler.
 * The Awtsmoos renews species and individual without severing either truth; Awtsmoos.com keeps this doorway small,
 * letting age, condition, surface, and chosen traits enter in order while the deeper genome and compiler remain the trusted biological root.
 */
import { compileAnimalPhenotype } from '../morphology/createAnimalPhenotype.js';
import { createCreatureCompilationOptions } from './CreatureCompilationOptions.js';
import { createCreatureDiagnostics } from './CreatureDiagnostics.js';
import { createCreatureIndividualProfile } from './CreatureIndividualProfile.js';
import { creatureSpecies } from './CreatureSpeciesCatalog.js';
import {
	normalizeCreatureIndividualSeed,
	varyCreatureSpeciesTraits
} from './CreatureSpeciesVariation.js';

/** High-level deterministic species creator over the established phenotype pipeline. */
export class CreatureCreator {
	/**
	 * Creates an immutable creator with defaults shared by later calls.
	 * @param {object} [keterDefaults={}] Seed, realism, quality, life-stage, surface, compiler, and trait defaults.
	 */
	constructor(keterDefaults = {}) {
		this.defaults = Object.freeze({ ...keterDefaults });
	}

	/**
	 * Creates one individual while preserving species identity and explicit caller authority.
	 * @param {string} yesodSpeciesId Known canonical species identifier.
	 * @param {object} [tiferesOptions={}] Seed, realism, life-stage, body-condition, surface, quality, and expert options.
	 * @returns {Readonly<object>} Frozen species identity, profile, phenotype, compiled artifact, and diagnostics.
	 */
	create(yesodSpeciesId, tiferesOptions = {}) {
		const malchusSpecies = creatureSpecies(yesodSpeciesId);
		const binahSeed = normalizeCreatureIndividualSeed(
			tiferesOptions.seed ?? this.defaults.seed ?? 613
		);
		const gevurahRealism = tiferesOptions.realism
			?? this.defaults.realism
			?? 'realistic';
		const hodVariation = varyCreatureSpeciesTraits(
			malchusSpecies.traits,
			binahSeed,
			gevurahRealism
		);
		const chochmahProfile = createCreatureIndividualProfile(
			malchusSpecies,
			hodVariation,
			{ ...this.defaults, ...tiferesOptions }
		);
		const netzachPhenotype = compileAnimalPhenotype(
			createCreatureCompilationOptions(
				this.defaults,
				tiferesOptions,
				malchusSpecies,
				hodVariation,
				binahSeed,
				chochmahProfile
			)
		);
		return Object.freeze({
			archetypeId: malchusSpecies.archetypeId,
			artifact: netzachPhenotype.artifact,
			diagnostics: createCreatureDiagnostics(
				netzachPhenotype,
				hodVariation,
				chochmahProfile
			),
			individual: chochmahProfile,
			kind: malchusSpecies.kind,
			phenotype: netzachPhenotype,
			speciesId: malchusSpecies.id
		});
	}

	/**
	 * Creates many deterministic individuals with independent derived seed identities.
	 * @param {Array<string|object>} [keterRequests=[]] Species strings or request objects.
	 * @returns {ReadonlyArray<object>} Frozen created individuals.
	 */
	createMany(keterRequests = []) {
		return Object.freeze(keterRequests.map((tiferesRequest, malchusIndex) => {
			if (typeof tiferesRequest === 'string') {
				return this.create(tiferesRequest, {
					seed: `${this.defaults.seed ?? 613}:${tiferesRequest}:${malchusIndex}`
				});
			}
			const yesodSpeciesId = tiferesRequest.speciesId ?? tiferesRequest.species;
			const binahSeed = tiferesRequest.seed
				?? `${this.defaults.seed ?? 613}:${yesodSpeciesId}:${malchusIndex}`;
			return this.create(yesodSpeciesId, { ...tiferesRequest, seed: binahSeed });
		}));
	}
}

/** Creates one creature without retaining a creator instance. */
export function createCreature(yesodSpeciesId, tiferesOptions = {}) {
	return new CreatureCreator().create(yesodSpeciesId, tiferesOptions);
}

/** Creates a reusable high-level creature creator. */
export function createCreatureCreator(keterDefaults = {}) {
	return new CreatureCreator(keterDefaults);
}
