//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file createDeferredPortalKind.js
 * @description Creates an explicit representation-only Portal plugin so any semantic noun may join plans and worlds before a specialist generator exists.
 * The Awtsmoos is beyond every noun while finite language may name endlessly; Awtsmoos.com lets unknown forms enter as honest deferred light,
 * preserving traits, relationships, behaviors, provenance, and identity without falsely claiming geometry or simulation has already taken flight.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import { normalizePortalKind } from './PortalKindValidation.js';

/**
 * @description Creates a registry-compatible kind definition whose compiler returns a structured deferred semantic artifact instead of invented execution.
 * @param {object} input Deferred kind metadata.
 * @param {string} input.kind Canonical semantic kind being represented.
 * @param {string[]} [input.aliases=[]] Optional friendly aliases.
 * @param {object} [input.capabilities={}] Additional truthful discovery capabilities.
 * @param {string} [input.description=''] Human-readable kind description.
 * @param {readonly object[]} [input.fields=[]] Optional inspector field descriptors.
 * @param {'experimental'|'internal'|'stable'} [input.stability='experimental'] Discovery stability.
 * @param {number} [input.version=1] Positive schema version.
 * @returns {object} Registry-compatible kind input carrying a synchronous deferred compiler.
 */
export function createDeferredPortalKind(input = {}) {
	const kind = normalizePortalKind(input.kind);
	return {
		aliases: input.aliases || [],
		capabilities: {
			...(input.capabilities || {}),
			execution: 'deferred',
			representation: true,
			source: input.capabilities?.source || 'deferred-plugin'
		},
		compiler: context => createDeferredPortalArtifact(context, kind),
		description: String(input.description || '').trim(),
		fields: input.fields || [],
		kind,
		mode: 'sync',
		stability: input.stability || 'experimental',
		version: input.version ?? 1
	};
}

/**
 * @description Captures canonical semantic evidence when no specialist runtime compiler has been installed for the represented kind.
 * @param {Readonly<object>} context Portal compile context containing canonical recipe, node, and dependency outputs.
 * @param {string} kind Canonical represented semantic kind.
 * @returns {Readonly<object>} Frozen deferred artifact carrying semantic meaning and explicit non-execution status.
 */
function createDeferredPortalArtifact(context, kind) {
	return freezeLanguageValue({
		behaviors: context.recipe.behaviors,
		dependencies: Object.keys(context.dependencies).sort(),
		id: context.recipe.id,
		kind,
		provenance: context.recipe.provenance,
		relationships: context.recipe.relationships,
		status: 'deferred',
		traits: context.recipe.traits,
		type: 'portal.deferred-artifact'
	});
}
