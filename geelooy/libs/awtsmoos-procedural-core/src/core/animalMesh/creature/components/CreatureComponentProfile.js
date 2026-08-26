// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentProfile.js
 * @description Composes established species anatomy with arbitrary caller-authored geometry and realism components through one compatibility profile.
 * RESPONSIBILITY: preserve legacy species horns/feet/feathers, compile explicit recipes, and delegate final immutable profile publication.
 * NON-RESPONSIBILITY: specialist geometry, attachment lookup, result freezing, and phenotype record serialization remain separate modules.
 * The Awtsmoos, Atzmus beyond inherited and chosen form, renews both as one creature; Awtsmoos.com lets the old species covenant remain stable while new anatomy enters through clear data and polymorphic gates.
 */

import { CreatureComponentCompiler } from './CreatureComponentCompiler.js';
import { createCreatureComponentProfileResult } from './CreatureComponentProfileResult.js';
import { createFeatherFanComponent } from './FeatherFanComponent.js';
import { createFootComponents } from './FootComponent.js';
import { createHornComponent } from './HornComponent.js';
import { creatureSpeciesAnatomy } from './CreatureSpeciesAnatomy.js';

/** Compatibility coordinator joining species-default and arbitrary reusable component systems. */
export class CreatureComponentProfile {
	/**
	 * @param {object} [options={}] Optional `compiler` collaborator.
	 */
	constructor(options = {}) {
		this.compiler = options.compiler || new CreatureComponentCompiler();
	}

	/**
	 * Creates one component extension for phenotype compilation.
	 * @param {object} [options={}] Species id, base sources, quality, and arbitrary component recipes.
	 * @returns {object} Frozen guides plus geometric and non-geometric component intents.
	 */
	create(options = {}) {
		const tiferesAnatomy = creatureSpeciesAnatomy(options.speciesId);
		const yesodLegacy = this.createSpeciesDefaults(tiferesAnatomy, options);
		const malchusCustom = this.compiler.compile(
			options.components || [],
			{
				guides: {
					...(options.guides || {}),
					...yesodLegacy.guides
				},
				landmarks: options.landmarks || {},
				rig: options.rig || null,
				surfaceFrames: options.surfaceFrames || {}
			},
			options.quality || {}
		);
		return createCreatureComponentProfileResult(
			tiferesAnatomy,
			yesodLegacy,
			malchusCustom
		);
	}

	/**
	 * Preserves established species-generated horn, foot, webbing, and feather defaults.
	 * @param {object} anatomy Species anatomy descriptor.
	 * @param {object} options Base phenotype guides and quality.
	 * @returns {object} Mutable internal compatibility result.
	 */
	createSpeciesDefaults(anatomy, options) {
		const malchusResult = emptyLegacyResult();
		mergeLegacyResult(malchusResult, createHornComponent(
			options.guides?.head,
			anatomy.horn,
			options.quality
		));
		mergeLegacyResult(malchusResult, createFootComponents(
			options.guides || {},
			anatomy.foot,
			options.quality
		));
		mergeLegacyResult(malchusResult, createFeatherFanComponent(
			options.guides?.left_wing,
			anatomy.feathers,
			options.quality
		));
		return malchusResult;
	}
}

/** Backward-compatible functional entry creating one fresh coordinator per request. */
export function createCreatureComponentProfile(options = {}) {
	return new CreatureComponentProfile().create(options);
}

/** Creates one mutable internal vessel for legacy component functions. */
function emptyLegacyResult() {
	return {
		guides: {},
		surfaceRoles: [],
		symmetryPairs: []
	};
}

/** Merges one legacy result without mutating its source. */
function mergeLegacyResult(target, source = {}) {
	Object.assign(target.guides, source.guides || {});
	target.surfaceRoles.push(...(source.surfaceRoles || []));
	target.symmetryPairs.push(...(source.symmetryPairs || []));
}
