// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { ERROR_CODES, RESOURCE_BUCKETS } from "./constants.js";
import { cloneJson } from "./data.js";
import { UniversalApiError } from "./errors.js";
import { createWorldDocument } from "./world.js";

function mergeBucket(target, incoming, policy, bucket) {
	for (const [id, resource] of Object.entries(incoming ?? {})) {
		if (!(id in target)) {
			target[id] = cloneJson(resource);
			continue;
		}
		if (policy === "keep-existing") continue;
		if (policy === "replace") {
			target[id] = cloneJson(resource);
			continue;
		}
		if (policy === "merge-properties") {
			target[id] = { ...target[id], ...cloneJson(resource), id };
			continue;
		}
		throw new UniversalApiError(
			ERROR_CODES.CONFLICT,
			`Resource conflict at resources.${bucket}.${id}`,
			{ bucket, resourceId: id }
		);
	}
}

async function loadImport(entry, options, ancestry) {
	if (entry.document) return entry.document;
	if (!options.resolveImport) {
		throw new UniversalApiError(ERROR_CODES.IMPORT_NOT_FOUND, `No resolver for import: ${entry.source}`);
	}
	if (ancestry.includes(entry.source)) {
		throw new UniversalApiError(ERROR_CODES.IMPORT_CYCLE, `Circular import: ${entry.source}`, { ancestry });
	}
	return options.resolveImport(entry.source, entry);
}

/** Composes modular documents with deterministic explicit conflict behavior. */
export async function composeWorldDocuments(rootInput, options = {}, ancestry = []) {
	const root = createWorldDocument(rootInput);
	for (const entry of rootInput.imports ?? []) {
		if (entry.condition === false) continue;
		let imported;
		try {
			imported = await loadImport(entry, options, ancestry);
		} catch (error) {
			if (entry.optional) continue;
			throw error;
		}
		const composed = await composeWorldDocuments(imported, options, [...ancestry, entry.source ?? "embedded"]);
		const policy = entry.conflictPolicy ?? "error";
		for (const bucket of RESOURCE_BUCKETS) {
			const incoming = composed.resources[bucket];
			if (!entry.namespace) {
				mergeBucket(root.resources[bucket], incoming, policy, bucket);
				continue;
			}
			for (const [id, resource] of Object.entries(incoming)) {
				const namespacedId = `${entry.namespace}:${id}`;
				mergeBucket(root.resources[bucket], { [namespacedId]: { ...resource, id: namespacedId } }, policy, bucket);
			}
		}
	}
	return root;
}
