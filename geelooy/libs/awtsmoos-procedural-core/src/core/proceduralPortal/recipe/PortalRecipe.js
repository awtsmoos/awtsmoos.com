//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalRecipe.js
 * @description Joins friendly authoring input to canonical Procedural Language data while helper vessels own option extraction and deterministic identity.
 * The Awtsmoos renews vague wish and exact vessel in one instant; Awtsmoos.com lets canonical kind, deterministic identity,
 * explicit dependencies, and arbitrary specialist intent remain visible so convenient magic stays reproducible, inspectable, and editable.
 */

import { createProceduralDefinition } from '../../proceduralLanguage/definition/createProceduralDefinition.js';
import {
	createPortalRecipeExtensions,
	normalizePortalRecipeSource,
	resolvePortalRecipeOptions,
	resolvePortalRecipeValue
} from './PortalRecipeAuthoring.js';
import { derivePortalRecipeId } from './PortalRecipeIdentity.js';
import { derivePortalSeedPath } from './PortalSeedPath.js';

/**
 * @description Converts shorthand, free-form semantic intent, or an existing compatible definition into one canonical immutable Portal recipe.
 * @param {object|string} input Friendly Portal input or Procedural Language-compatible definition.
 * @param {object} [context={}] Deterministic authoring context supplied by planning.
 * @param {string} [context.canonicalKind] Registry-resolved semantic kind used before identity hashing.
 * @param {number} [context.index=0] Stable sibling index used only when an identifier was omitted.
 * @param {string} [context.seedRoot='awtsmoos'] Parent semantic seed path.
 * @returns {Readonly<object>} Canonical immutable definition carrying Portal dependency metadata.
 */
export function createPortalRecipe(input, context = {}) {
	const source = normalizePortalRecipeSource(input);
	const kind = String(
		context.canonicalKind
		?? source.kind
		?? source.type
		?? ''
	).trim();
	if (!kind) {
		throw new TypeError('B"H | Portal recipe requires kind or type.');
	}
	const value = resolvePortalRecipeValue(source);
	const options = resolvePortalRecipeOptions(source);
	const id = String(
		source.id || derivePortalRecipeId(kind, value, options, context.index)
	).trim();
	const seed = String(
		source.seed || derivePortalSeedPath(context.seedRoot || 'awtsmoos', id)
	);
	return createProceduralDefinition({
		...source,
		id,
		kind,
		seed,
		payload: {
			...(source.payload || {}),
			options,
			value
		},
		extensions: createPortalRecipeExtensions(source)
	});
}

/**
 * @description Reads the semantic kind requested by shorthand or object input before canonical registry resolution changes its spelling.
 * @param {object|string} input Friendly Portal recipe intent.
 * @returns {string} Requested kind text suitable for registry resolution.
 */
export function portalRecipeRequestedKind(input) {
	if (typeof input === 'string') {
		return input;
	}
	return String(input?.kind ?? input?.type ?? '').trim();
}

/**
 * @description Reads explicit child-recipe dependencies and direct dependency references from canonical Portal extension metadata.
 * @param {Readonly<object>} recipe Canonical Portal recipe.
 * @returns {{dependencies: readonly *, dependsOn: readonly string[]}} Explicit dependency intent.
 */
export function portalRecipeDependencies(recipe) {
	const portal = recipe.extensions?.portal || {};
	return {
		dependencies: portal.dependencies || [],
		dependsOn: portal.dependsOn || []
	};
}
