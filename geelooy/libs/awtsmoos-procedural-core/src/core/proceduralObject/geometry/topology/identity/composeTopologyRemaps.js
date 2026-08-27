// B"H

import { createTopologyRemapArtifact } from "./createTopologyRemapArtifact.js";
import {
	TOPOLOGY_IDENTITY_DOMAINS,
	assertTopologyRemapArtifact,
	topologyReferencesEqual
} from "./identityContract.js";

function composeDomain(firstMapping, secondMapping, domain) {
	return Object.freeze(Object.fromEntries(Object.entries(firstMapping).map(([sourceId, middleId]) => {
		if (middleId == null) return [sourceId, null];
		if (!Object.hasOwn(secondMapping, middleId)) {
			throw new Error(`Second topology remap is incomplete for ${domain} id: ${middleId}`);
		}
		return [sourceId, secondMapping[middleId] ?? null];
	})));
}

/** Composes two exact consecutive topology transitions into one lineage artifact. */
export function composeTopologyRemaps(firstInput, secondInput, options = {}) {
	const first = assertTopologyRemapArtifact(firstInput);
	const second = assertTopologyRemapArtifact(secondInput);
	if (!topologyReferencesEqual(first.target, second.source)) {
		throw new Error("Topology remaps are not consecutive revisions.");
	}
	const mappings = Object.freeze(Object.fromEntries(
		TOPOLOGY_IDENTITY_DOMAINS.map(domain => [
			domain,
			composeDomain(first.mappings[domain], second.mappings[domain], domain)
		])
	));
	return createTopologyRemapArtifact({
		operation: options.operation ?? "compose_topology_remaps",
		source: first.source,
		target: second.target,
		mappings,
		metadata: {
			...(options.metadata ?? {}),
			componentRemapIds: [first.id, second.id]
		}
	});
}
