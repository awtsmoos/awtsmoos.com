// B"H
// Boruch Hashem
// Blessed is He

/**
 * Every semantic operation is a named vessel, while the Awtsmoos remains the
 * single source of its possibility. Awtsmoos.com exposes these contracts so
 * callers inspect determinism, mutation, topology, rollback, and resource law.
 */

import { CREATURE_OPERATION_NAMES } from "./operationNames.js";

function topologyEffect(name) {
	if (/section\.(insert|remove)|body\.resample|limb\.(create|branch|joint\.(insert|remove))|part\.(attach|remove|clone)/.test(name)) {
		return "may-change-derived-topology";
	}
	if (/compile|skin|rig|motion|material\.compile|export/.test(name)) {
		return "derived-artifacts-only";
	}
	return "topology-preserving-semantic-edit";
}

function sideEffects(name) {
	if (/^creature\.(create|clone|branch)$/.test(name)) {
		return ["artifact-store-write"];
	}
	if (name.startsWith("transaction.") || /^creature\.(undo|redo)$/.test(name)) {
		return ["transaction-or-history-state-write"];
	}
	if (/\.(validate|inspect|compare|evaluate|explain|estimate|report|list)$/.test(name)) {
		return [];
	}
	return ["target-artifact-or-transaction-draft-write"];
}

function createOperationDefinition(name) {
	const effects = sideEffects(name);
	return Object.freeze({
		operation: name,
		version: "1.0.0",
		inputSchema: {
			type: "object",
			properties: {
				operation: { const: name },
				version: { type: "string", default: "1.0.0" },
				target: { type: "object" },
				transactionId: { type: "string" },
				arguments: { type: "object", default: {} }
			},
			required: ["operation"]
		},
		outputSchema: { type: "object", additionalProperties: true },
		determinism: "deterministic-for-equal-state-and-arguments",
		sideEffects: effects,
		topologyEffects: topologyEffect(name),
		stableReferenceBehavior: "semantic-ids-preserved-where-source-anatomy-survives; explicit-lineage-otherwise",
		resourceModel: { time: "declared-by-operation-family", memory: "bounded-and-reportable" },
		failureCodes: [
			"CREATURE_OPERATION_UNKNOWN",
			"CREATURE_TARGET_NOT_FOUND",
			"CREATURE_ARGUMENT_INVALID",
			"CREATURE_VALIDATION_FAILED",
			"CREATURE_BUDGET_INVALID"
		],
		rollbackBehavior: effects.length ? "fully-rollbackable-before-commit" : "not-applicable",
		progressStages: ["resolve", "validate-input", "apply-or-derive", "validate-output", "complete"],
		cancellationBehavior: "cooperative-between-progress-stages"
	});
}

/**
 * Creates exact, inspectable operation contracts without duplicating dispatch
 * behavior. Complexity is O(n) in registered names and side effects are absent.
 *
 * @returns {Map<string, Object>} Versioned semantic operation definitions.
 */
export function createCreatureOperationCatalog() {
	return new Map(
		CREATURE_OPERATION_NAMES.map((name) => [name, createOperationDefinition(name)])
	);
}
