//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralDefinition.js
 * @description Reveals rich semantic fluent authoring over the canonical JSON
 * covenant while inheriting immutable payload, action, constraint, derivation,
 * hash, and serialization behavior from Yesod.
 * The Awtsmoos renews every trait and relationship while no fluent word becomes
 * a second source of truth;
 * Awtsmoos.com lets Tiferes add expressive authoring above one canonical data
 * river, keeping simple calls and infinite domains in a stable root.
 */

import { YesodProceduralDefinitionCore } from './ProceduralDefinitionCore.js';
import {
	withSemanticBehavior,
	withSemanticCompilePolicy,
	withSemanticProvenance,
	withSemanticRelationship,
	withSemanticTrait
} from './ProceduralDefinitionSemanticEdits.js';

export class ProceduralDefinition extends YesodProceduralDefinitionCore {
	/**
	 * @description Adds or replaces one stable-address semantic trait through
	 * canonical normalization without mutating this wrapper or creating lineage.
	 * @param {string} yesodTraitId Stable path-safe trait id.
	 * @param {object} [chochmahInput={}] Trait kind, values, constraints,
	 * affected channels, editor hints, and metadata.
	 * @returns {ProceduralDefinition} New fluent definition containing the trait.
	 */
	trait(yesodTraitId, chochmahInput = {}) {
		return this.spawn(
			withSemanticTrait(this.value, yesodTraitId, chochmahInput)
		);
	}

	/**
	 * @description Appends one renderer-neutral graph relationship so arbitrary
	 * domains may express containment, support, attachment, growth, or routing.
	 * @param {string} gevurahType Generic relationship type.
	 * @param {object} [chochmahInput={}] Relationship id, from/to endpoints,
	 * values, and metadata.
	 * @returns {ProceduralDefinition} New fluent definition containing the
	 * canonical relationship.
	 */
	relationship(gevurahType, chochmahInput = {}) {
		return this.spawn(
			withSemanticRelationship(this.value, gevurahType, chochmahInput)
		);
	}

	/**
	 * @description Appends one generic behavior whose runtime meaning remains
	 * delegated to matching domain compilers rather than hardcoded in the kernel.
	 * @param {string} netzachKind Behavior kind such as `grows`, `flows`, `opens`,
	 * or any plugin-defined semantic id.
	 * @param {object} [chochmahInput={}] Behavior id, enabled state, triggers,
	 * values, affected channels, and metadata.
	 * @returns {ProceduralDefinition} New fluent definition containing the
	 * canonical behavior.
	 */
	behavior(netzachKind, chochmahInput = {}) {
		return this.spawn(
			withSemanticBehavior(this.value, netzachKind, chochmahInput)
		);
	}

	/**
	 * @description Replaces root compilation intent with a canonical policy while
	 * leaving required/optional artifact routing to the artifact-request API.
	 * @param {object} [chochmahInput={}] Compile channels, quality, validation,
	 * cache, trace, adapter/failure policy, budget, LOD, and metadata.
	 * @returns {ProceduralDefinition} New fluent definition containing compile
	 * intent.
	 */
	compilePolicy(chochmahInput = {}) {
		return this.spawn(
			withSemanticCompilePolicy(this.value, chochmahInput)
		);
	}

	/**
	 * @description Merges explicit authored lineage without invoking derivation,
	 * preserving current identity and revision while adding source/tool evidence.
	 * @param {object} [chochmahInput={}] Provenance additions such as author,
	 * tool, sources, references, timestamp, metadata, or compatible legacy keys.
	 * @returns {ProceduralDefinition} New fluent definition containing canonical
	 * provenance.
	 */
	withProvenance(chochmahInput = {}) {
		return this.spawn(
			withSemanticProvenance(this.value, chochmahInput)
		);
	}
}
