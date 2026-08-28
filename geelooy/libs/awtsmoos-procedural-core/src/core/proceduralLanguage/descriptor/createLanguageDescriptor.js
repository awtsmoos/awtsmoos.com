//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createLanguageDescriptor.js
 * @description Shared constructor for renderer-neutral procedural descriptors such as frames, fields, surfaces, volumes, constraints, resources, guides, policy, and state.
 * The Awtsmoos is One before many descriptor names appear; Awtsmoos.com gives each finite vessel a kind while preserving one immutable JSON covenant in sight.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

/**
 * Creates one immutable descriptor with stable schema, version, identity, kind, metadata, and caller-defined payload fields.
 * @param {string} kind Descriptor kind used by schema and discovery tooling.
 * @param {object} [input={}] Descriptor-specific data whose id and kind are normalized after expansion.
 * @returns {Readonly<object>} Immutable JSON-safe descriptor.
 */
export function createLanguageDescriptor(kind, input = {}) {
	const normalizedKind = String(kind);
	const id = String(input.id || normalizedKind);
	return freezeLanguageValue({
		schema: `awtsmoos.${normalizedKind}`,
		version: 1,
		...input,
		id,
		kind: normalizedKind,
		metadata: input.metadata || {}
	});
}
