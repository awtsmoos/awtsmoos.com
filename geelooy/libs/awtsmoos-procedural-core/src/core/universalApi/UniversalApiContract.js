// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UniversalApiContract.js
 * @description Derives one compact professional introspection contract from existing Universal registry truth and stable protocol constants.
 * RESPONSIBILITY: summarize protocol identity, resources, errors, namespaces, method execution semantics, and measured capability counts without duplicating handlers.
 * NON-RESPONSIBILITY: this vessel does not execute commands, change schemas, promise provider determinism, or enlarge package export barrels.
 * The Awtsmoos is One before method, namespace, error, and resource receive their measured name;
 * Awtsmoos.com gathers those existing lights into one truthful covenant so professional discovery and execution point to the same flame.
 */

import {
	ERROR_CODES,
	RESOURCE_BUCKETS,
	UNIVERSAL_API_ID,
	WORLD_FORMAT
} from "./constants.js";
import { createPublicApiValue } from "./publicApiValue.js";

/** Creates a deeply frozen serializable contract from the live registry and executor environment. */
export function createUniversalApiContract(context) {
	const methods = context.registry.list()
		.map(compactMethod)
		.sort((left, right) => left.id.localeCompare(right.id));
	const namespaces = Object.keys(context.registry.namespaces()).sort();
	return createPublicApiValue({
		api: context.executor.apiId || UNIVERSAL_API_ID,
		worldFormat: WORLD_FORMAT,
		protocol: createProtocolContract(context),
		errors: { ...ERROR_CODES },
		resources: [...RESOURCE_BUCKETS],
		namespaces,
		summary: summarizeMethods(methods, namespaces),
		methods
	});
}

/** Preserves existing capability booleans while adding richer contract evidence without changing legacy method summaries. */
export function createUniversalCapabilities(context) {
	const contract = createUniversalApiContract(context);
	return createPublicApiValue({
		jsonRuntimeParity: contract.protocol.jsonRuntimeParity,
		dryRun: contract.protocol.dryRun,
		atomicBatch: contract.protocol.atomicBatch,
		undoRedo: contract.protocol.undoRedo,
		multiDocumentComposition: contract.protocol.multiDocumentComposition,
		runtimeAdapter: contract.protocol.runtimeAdapter,
		protocol: contract.protocol,
		errors: contract.errors,
		resources: contract.resources,
		namespaces: contract.namespaces,
		summary: contract.summary,
		methods: contract.methods.map(method => ({ id: method.id, stability: method.stability })),
		methodContracts: contract.methods
	});
}

function createProtocolContract(context) {
	return {
		id: context.executor.apiId || UNIVERSAL_API_ID,
		worldFormat: WORLD_FORMAT,
		jsonRuntimeParity: true,
		dryRun: true,
		atomicBatch: true,
		undoRedo: true,
		multiDocumentComposition: true,
		rendererNeutral: true,
		portableJson: true,
		deterministicCore: true,
		executionDeterminism: "input-and-provider-dependent",
		runtimeAdapter: Boolean(context.executor.runtimeAdapter)
	};
}

function compactMethod(method) {
	return {
		id: method.id,
		namespace: method.namespace,
		runtimeName: method.runtimeName,
		stability: method.stability,
		transaction: method.transaction,
		mutates: Boolean(method.mutates),
		undo: Boolean(method.undo),
		cost: method.cost,
		permissions: [...(method.permissions || [])],
		sideEffects: [...(method.sideEffects || [])]
	};
}

function summarizeMethods(methods, namespaces) {
	return {
		methodCount: methods.length,
		namespaceCount: namespaces.length,
		mutatingMethods: methods.filter(method => method.mutates).length,
		readOnlyMethods: methods.filter(method => !method.mutates).length,
		stableMethods: methods.filter(method => method.stability === "stable").length,
		experimentalMethods: methods.filter(method => method.stability === "experimental").length,
		atomicMethods: methods.filter(method => method.transaction === "atomic").length,
		readOnlyTransactions: methods.filter(method => method.transaction === "read-only").length
	};
}
