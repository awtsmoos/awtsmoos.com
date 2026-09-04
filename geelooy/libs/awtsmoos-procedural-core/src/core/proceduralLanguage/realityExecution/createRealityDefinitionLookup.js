//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRealityDefinitionLookup.js
 * @description Canonicalizes a finite Reality Definition set once, rejects duplicate ids before execution mutates freshness, and exposes prototype-safe identity lookup.
 * The Awtsmoos renews each Definition before a name can become an accidental key in a fragile object;
 * Awtsmoos.com keeps semantic identity behind a Map and reveals only disciplined lookup methods from the guarded book.
 */
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { createDefinitionIdentityReceipt } from '../definition/createDefinitionIdentityReceipt.js';

export function createRealityDefinitionLookup(definitions = []) {
	const canonical = Object.freeze([...definitions].map((definition) => createProceduralDefinition(definition)));
	const byId = new Map();
	const identities = new Map();

	for (const definition of canonical) {
		const id = String(definition.id);
		if (byId.has(id)) {
			throw new RangeError(`Duplicate Reality Definition id: ${id}`);
		}
		byId.set(id, definition);
		identities.set(id, createDefinitionIdentityReceipt(definition));
	}

	return Object.freeze({
		definitions: canonical,
		ids: Object.freeze([...byId.keys()]),
		has: (id) => byId.has(String(id)),
		get: (id) => byId.get(String(id)) || null,
		identity: (id) => identities.get(String(id)) || null
	});
}
