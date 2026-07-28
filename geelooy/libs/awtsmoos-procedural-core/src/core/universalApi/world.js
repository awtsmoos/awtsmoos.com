// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { RESOURCE_BUCKETS, WORLD_FORMAT } from "./constants.js";
import { cloneJson } from "./data.js";

/** Creates the authoritative serializable world document. */
export function createWorldDocument(input = {}) {
	const resources = Object.fromEntries(
		RESOURCE_BUCKETS.map((bucket) => [bucket, {}])
	);
	for (const [bucket, values] of Object.entries(input.resources ?? {})) {
		resources[bucket] = cloneJson(values);
	}
	return {
		format: WORLD_FORMAT,
		version: 1,
		revision: Number.isInteger(input.revision) ? input.revision : 0,
		metadata: cloneJson(input.metadata ?? {}),
		imports: cloneJson(input.imports ?? []),
		resources,
		scenes: cloneJson(input.scenes ?? {}),
		timeline: cloneJson(input.timeline ?? {}),
		render: cloneJson(input.render ?? {}),
		dependencies: cloneJson(input.dependencies ?? {}),
		plugins: cloneJson(input.plugins ?? {})
	};
}

/** Normalizes the minimum stable resource contract. */
export function normalizeResource(bucket, input, previous = null) {
	const revision = previous ? previous.revision + 1 : 1;
	return {
		id: input.id,
		type: input.type ?? bucket.replace(/s$/, ""),
		version: input.version ?? 1,
		revision,
		name: input.name ?? input.id,
		enabled: input.enabled !== false,
		metadata: cloneJson(input.metadata ?? {}),
		references: cloneJson(input.references ?? []),
		...cloneJson(input),
		revision
	};
}
