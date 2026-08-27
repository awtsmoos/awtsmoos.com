//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalRevision.js
 * @description Derives immutable Portal intent through the canonical Procedural Language inheritance law instead of shallow mutation or hidden state.
 * The Awtsmoos renews every descendant while inherited meaning remains held in one source; Awtsmoos.com lets revision
 * preserve traits, relationships, behaviors, payload, and provenance while explicit overrides receive a new finite course.
 */

import { deriveProceduralDefinition } from '../../proceduralLanguage/definition/deriveProceduralDefinition.js';
import { createPortalRecipe, portalRecipeRequestedKind } from '../recipe/PortalRecipe.js';

/**
 * @description Canonicalizes one Portal input through the live registry and returns a derived immutable definition with explicit parent provenance.
 * @param {object} portal ProceduralPortal-like facade exposing registry and seed.
 * @param {object|string} input Semantic root intent or compatible Procedural Language definition.
 * @param {object} [overrides={}] Section-aware Procedural Language overrides for the derived revision.
 * @param {object} [options={}] Canonicalization context.
 * @param {number} [options.index=0] Stable sibling index used only when the input omitted an id.
 * @param {string|number} [options.seed] Optional seed-root override used while canonicalizing shorthand input.
 * @returns {Readonly<object>} Canonical immutable derived definition suitable for planning, persistence, or another revision.
 */
export function revisePortalIntent(portal, input, overrides = {}, options = {}) {
	const requestedKind = portalRecipeRequestedKind(input);
	const definition = portal.registry.resolve(requestedKind);
	const parent = createPortalRecipe(input, {
		canonicalKind: definition.kind,
		index: options.index ?? 0,
		seedRoot: options.seed ?? portal.seed
	});
	return deriveProceduralDefinition(parent, {
		...overrides,
		revision: overrides.revision ?? parent.revision + 1
	});
}
