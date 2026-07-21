// B"H

import {
	assertStableId,
	createArtifactReference,
	createStableId
} from "../../../foundation/artifacts/index.js";
import {
	hashCanonicalValue,
	normalizeCanonicalValue
} from "../../../foundation/canonical/index.js";
import {
	TOPOLOGY_IDENTITY_DOMAINS,
	TOPOLOGY_REMAP_SCHEMA,
	createTopologyIdentityReference
} from "./identityContract.js";

const OPERATION_PATTERN = /^[a-z][a-z0-9_.-]*$/i;

function normalizeReference(value) {
	return value?.schema === "awtsmoos.topology-identity"
		? createTopologyIdentityReference(value)
		: createArtifactReference(value);
}

function normalizeDomainMapping(input, domain) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError(`Topology ${domain} mapping must be an object.`);
	}
	const entries = Object.keys(input).sort().map(sourceId => {
		assertStableId(sourceId, `${domain} source id`);
		const targetId = input[sourceId];
		if (targetId != null) assertStableId(targetId, `${domain} target id`);
		return [sourceId, targetId ?? null];
	});
	return Object.freeze(Object.fromEntries(entries));
}

function summarizeMappings(mappings) {
	const removed = {};
	const merged = {};
	for (const domain of TOPOLOGY_IDENTITY_DOMAINS) {
		removed[domain] = Object.freeze(Object.entries(mappings[domain])
			.filter(([, targetId]) => targetId == null)
			.map(([sourceId]) => sourceId));
		const sourcesByTarget = new Map();
		for (const [sourceId, targetId] of Object.entries(mappings[domain])) {
			if (targetId == null) continue;
			sourcesByTarget.set(targetId, [...(sourcesByTarget.get(targetId) ?? []), sourceId]);
		}
		merged[domain] = Object.freeze([...sourcesByTarget.entries()]
			.filter(([, sourceIds]) => sourceIds.length > 1)
			.sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
			.map(([targetId, sourceIds]) => Object.freeze({
				targetId,
				sourceIds: Object.freeze(sourceIds.sort())
			})));
	}
	return { removed: Object.freeze(removed), merged: Object.freeze(merged) };
}

/** Creates a complete, content-addressed topology lineage artifact. */
export function createTopologyRemapArtifact(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Topology remap input must be an object.");
	}
	if (typeof input.operation !== "string" || !OPERATION_PATTERN.test(input.operation)) {
		throw new TypeError("Topology remap operation must be a machine identifier.");
	}
	const mappings = Object.freeze(Object.fromEntries(
		TOPOLOGY_IDENTITY_DOMAINS.map(domain => [
			domain,
			normalizeDomainMapping(input.mappings?.[domain] ?? {}, domain)
		])
	));
	const summary = summarizeMappings(mappings);
	const content = Object.freeze({
		operation: input.operation,
		source: normalizeReference(input.source),
		target: normalizeReference(input.target),
		mappings,
		removed: summary.removed,
		merged: summary.merged,
		metadata: normalizeCanonicalValue(input.metadata ?? {})
	});
	return Object.freeze({
		schema: TOPOLOGY_REMAP_SCHEMA,
		id: input.id == null ? createStableId("topology-remap", content) : assertStableId(input.id, "Topology remap id"),
		contentHash: hashCanonicalValue(content),
		...content
	});
}
