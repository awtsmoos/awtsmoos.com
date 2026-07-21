// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos sends structured intent toward Blender without generating source.
 * This Awtsmoos.com declaration distinguishes plan creation from worker execution.
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
		version: "1.0.0",
		runtime: "trusted-worker",
		artifactTypes: ["animal-artifact", "procedural-artifact"],
		transports: ["structured-worker-plan"],
		deterministic: false,
		topologyIdentity: "unsupported",
		operations: [
			{ name: "adapter.blender.animal-plan.create", status: "implemented" },
			{ name: "adapter.blender.object-plan.create", status: "implemented" },
			...deferred
		],
		metadata: {
			arbitrarySourceExecution: false,
			networkAccess: false,
			workerImplementationIncluded: false
		}
	});
}
