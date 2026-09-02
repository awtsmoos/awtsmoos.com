//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralDefinition.js
 * @description Reveals rich semantic fluent authoring over canonical JSON while
 * inheriting immutable payload, action, constraint, derivation, hash, and export.
 * The Awtsmoos renews every trait and relationship while no fluent word becomes
 * a second source of truth;
 * Awtsmoos.com lets Tiferes add expressive authoring above one canonical river.
 */

import { YesodProceduralDefinitionCore } from './ProceduralDefinitionCore.js';
import {
	withSemanticCompilePolicy,
	withSemanticProvenance
} from './ProceduralDefinitionPolicyEdits.js';
import {
	withSemanticBehavior,
	withSemanticRelationship,
	withSemanticTrait
} from './ProceduralDefinitionSemanticEdits.js';

export class ProceduralDefinition extends YesodProceduralDefinitionCore {
	/**
	 * @description Adds or replaces one stable-address semantic trait through
	 * canonical normalization without mutating this wrapper or creating lineage.
	 * @param {string} yesodTraitId Stable path-safe trait id.
	 * @param {object} [chochmahInput={}] Trait authoring fields.
	 * @returns {ProceduralDefinition} New definition containing the trait.
	 */
	trait(yesodTraitId, chochmahInput = {}) {
		return this.spawn(
			withSemanticTrait(this.value, yesodTraitId, chochmahInput)
		);
	}

	/**
	 * @description Appends one renderer-neutral graph relationship.
	 * @param {string} gevurahType Generic relationship type.
	 * @param {object} [chochmahInput={}] Endpoints, values, metadata, and id.
	 * @returns {ProceduralDefinition} New definition with the relationship.
	 */
	relationship(gevurahType, chochmahInput = {}) {
		return this.spawn(
			withSemanticRelationship(this.value, gevurahType, chochmahInput)
		);
	}

	/**
	 * @description Appends one generic behavior whose runtime meaning remains
	 * delegated to matching domain compilers rather than hardcoded in the kernel.
	 * @param {string} netzachKind Plugin-defined behavior kind.
	 * @param {object} [chochmahInput={}] Behavior authoring fields.
	 * @returns {ProceduralDefinition} New definition with the behavior.
	 */
	behavior(netzachKind, chochmahInput = {}) {
		return this.spawn(
			withSemanticBehavior(this.value, netzachKind, chochmahInput)
		);
	}

	/**
	 * @description Replaces root compilation intent with a canonical policy.
	 * @param {object} [chochmahInput={}] Compile-policy authoring fields.
	 * @returns {ProceduralDefinition} New definition with compile intent.
	 */
	compilePolicy(chochmahInput = {}) {
		return this.spawn(
			withSemanticCompilePolicy(this.value, chochmahInput)
		);
	}

	/**
	 * @description Merges explicit authored lineage without invoking derivation.
	 * @param {object} [chochmahInput={}] Provenance additions.
	 * @returns {ProceduralDefinition} New definition with provenance evidence.
	 */
	withProvenance(chochmahInput = {}) {
		return this.spawn(
			withSemanticProvenance(this.value, chochmahInput)
		);
	}
}
