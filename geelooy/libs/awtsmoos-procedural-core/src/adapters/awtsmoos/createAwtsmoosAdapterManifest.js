// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews portable arrays and object trees as runtime vessels.
 * This Awtsmoos.com declaration names only the support implemented here.
 */

import { createAdapterCapabilityManifest } from "../../core/proceduralObject/foundation/adapters/index.js";

export function createAwtsmoosAdapterManifest() {
	return createAdapterCapabilityManifest({
		id: "adapter.awtsmoos.runtime",
		version: "1.0.0",
		runtime: "node.browser",
		artifactTypes: [
			"data-block",
			"geometry",
			"object",
			"procedural-artifact",
			"topology-identity",
			"topology-remap"
		],
		transports: ["in-memory"],
		deterministic: true,
		topologyIdentity: "artifact-only",
		operations: [
			{ name: "adapter.awtsmoos.component-array.materialize", status: "implemented" },
			{ name: "adapter.awtsmoos.geometry.materialize", status: "implemented" },
			{ name: "adapter.awtsmoos.object-runtime.create", status: "implemented" }
		],
		metadata: { executableLoading: false }
	});
}
