// B"H

import { createSelectionArtifact } from "../../../foundation/selections/index.js";
import {
	TOPOLOGY_IDENTITY_DOMAINS,
	assertTopologyRemapArtifact,
	topologyReferencesEqual
} from "./identityContract.js";

const WEIGHT_POLICIES = Object.freeze(["max", "sum", "average"]);

function assertSelectionSource(selection, remap) {
	if (!selection || selection.selectionSchema !== "awtsmoos.selection") {
		throw new TypeError("Topology selection artifact is invalid.");
	}
	if (!TOPOLOGY_IDENTITY_DOMAINS.includes(selection.domain)) {
		throw new TypeError(`Selection domain cannot traverse topology: ${selection.domain}`);
	}
	if (!topologyReferencesEqual(selection.target, remap.source)) {
		throw new Error("Selection target does not match topology remap source.");
	}
}

function mergeWeight(records, targetId, value, policy) {
	const record = records.get(targetId) ?? { total: 0, count: 0, maximum: -Infinity };
	record.total += value;
	record.count += 1;
	record.maximum = Math.max(record.maximum, value);
	records.set(targetId, record);
	if (policy === "sum") return record.total;
	if (policy === "average") return record.total / record.count;
	return record.maximum;
}

/** Migrates a stable selection through one exact topology revision transition. */
export function remapSelectionThroughTopology(selection, remapInput, options = {}) {
	const remap = assertTopologyRemapArtifact(remapInput);
	assertSelectionSource(selection, remap);
	const removedPolicy = options.removed ?? "drop";
	const weightPolicy = options.weights ?? "max";
	if (!["drop", "error"].includes(removedPolicy)) {
		throw new TypeError(`Unsupported removed-element policy: ${removedPolicy}`);
	}
	if (!WEIGHT_POLICIES.includes(weightPolicy)) {
		throw new TypeError(`Unsupported selection weight policy: ${weightPolicy}`);
	}
	const mapping = remap.mappings[selection.domain];
	const targetIds = new Set();
	const records = new Map();
	const weights = {};
	for (const sourceId of selection.elementIds) {
		if (!Object.hasOwn(mapping, sourceId)) {
			throw new Error(`Topology remap is missing selected element: ${sourceId}`);
		}
		const targetId = mapping[sourceId];
		if (targetId == null) {
			if (removedPolicy === "error") throw new Error(`Selected element was removed: ${sourceId}`);
			continue;
		}
		targetIds.add(targetId);
		if (selection.weights) {
			const sourceWeight = selection.weights[sourceId] ?? 1;
			weights[targetId] = mergeWeight(records, targetId, sourceWeight, weightPolicy);
		}
	}
	return createSelectionArtifact({
		target: remap.target,
		domain: selection.domain,
		elementIds: [...targetIds].sort(),
		weights: selection.weights ? weights : null,
		provenance: {
			operation: "topology-remap",
			sourceSelectionId: selection.id,
			remapId: remap.id,
			weightPolicy
		}
	});
}

export { WEIGHT_POLICIES as TOPOLOGY_SELECTION_WEIGHT_POLICIES };
