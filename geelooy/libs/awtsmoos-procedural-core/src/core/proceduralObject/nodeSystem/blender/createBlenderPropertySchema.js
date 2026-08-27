// B"H
// Boruch Hashem
// Blessed is He
/** RNA properties become immutable schemas before modifiers or nodes may depend on them. */

import { cloneManifestMetadata } from "../../foundation/canonical/cloneManifestMetadata.js";
import { normalizeBlenderIdentifier } from "./normalizeBlenderIdentifier.js";

function enumItems(items = []) {
	return Object.freeze(items.map(item => Object.freeze({
		identifier: String(item.identifier ?? item.id ?? item.name),
		name: String(item.name ?? item.identifier ?? item.id),
		description: String(item.description ?? ""),
		value: Number.isFinite(Number(item.value)) ? Number(item.value) : null
	})).sort((left, right) => left.identifier.localeCompare(right.identifier)));
}

export function createBlenderPropertySchema(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Blender property schema must be an object.");
	}
	const nativeIdentifier = String(input.nativeIdentifier ?? input.identifier ?? input.name ?? "property");
	const arrayLength = Math.max(0, Math.floor(Number(input.arrayLength ?? 0)));
	return Object.freeze({
		id: input.id ?? normalizeBlenderIdentifier(nativeIdentifier),
		nativeIdentifier,
		name: String(input.name ?? nativeIdentifier),
		description: String(input.description ?? ""),
		rnaType: String(input.rnaType ?? input.type ?? "UNKNOWN"),
		subtype: input.subtype ? String(input.subtype) : null,
		defaultValue: cloneManifestMetadata(input.defaultValue ?? null),
		minimum: Number.isFinite(Number(input.minimum)) ? Number(input.minimum) : null,
		maximum: Number.isFinite(Number(input.maximum)) ? Number(input.maximum) : null,
		softMinimum: Number.isFinite(Number(input.softMinimum)) ? Number(input.softMinimum) : null,
		softMaximum: Number.isFinite(Number(input.softMaximum)) ? Number(input.softMaximum) : null,
		arrayLength,
		readonly: input.readonly === true,
		animatable: input.animatable !== false,
		hidden: input.hidden === true,
		pointerType: input.pointerType ? String(input.pointerType) : null,
		collectionType: input.collectionType ? String(input.collectionType) : null,
		enumItems: enumItems(input.enumItems),
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}
