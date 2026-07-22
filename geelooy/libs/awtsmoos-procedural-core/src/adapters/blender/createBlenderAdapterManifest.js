// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos sends structured intent toward Blender without generating source.
 * This Awtsmoos.com declaration distinguishes plan creation, schema coverage,
 * and migration from execution inside a separately maintained trusted worker.
 */

import { PROCEDURAL_ADAPTER_OPERATIONS } from "../../core/proceduralObject/constants/proceduralObjectContract.js";
import { createAdapterCapabilityManifest } from "../../core/proceduralObject/foundation/adapters/index.js";

export function createBlenderAdapterManifest() {
	const deferred = PROCEDURAL_ADAPTER_OPERATIONS.map(name => ({
		name,
		status: "adapter-dependent",
		determinism: "external",
		notes: "Requires a separately maintained trusted Blender worker."
	}));
	return createAdapterCapabilityManifest({
		id: "adapter.blender.plan",
		version: "1.1.0",
		runtime: "trusted-worker",
		artifactTypes: [
			"animal-artifact",
			"procedural-artifact",
			"universal-node-tree",
			"node-schema-pack"
		],
		transports: ["structured-worker-plan"],
		deterministic: false,
		topologyIdentity: "semantic-plan-preserved",
		operations: [
			{ name: "adapter.blender.animal-plan.create", status: "implemented" },
			{ name: "adapter.blender.object-plan.create", status: "implemented" },
			{ name: "adapter.blender.node-plan.create", status: "implemented" },
			{ name: "adapter.blender.schema-pack.create", status: "implemented" },
			{ name: "adapter.blender.schema.coverage", status: "implemented" },
			{ name: "adapter.blender.schema.migration.plan", status: "implemented" },
			...deferred
		],
		metadata: {
			arbitrarySourceExecution: false,
			networkAccess: false,
			workerImplementationIncluded: false,
			builtInSemanticCatalog: "Blender 4.5 geometry and material core",
			opaqueFutureNodeFallback: true,
			uiAndOperatorParityClaimed: false
		}
	});
}
