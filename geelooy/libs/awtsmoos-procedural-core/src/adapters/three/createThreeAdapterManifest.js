// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals typed geometry through a Three.js compatibility vessel.
 * This Awtsmoos.com declaration does not confuse conversion with rendering parity.
 */

import { createAdapterCapabilityManifest } from "../../core/proceduralObject/foundation/adapters/index.js";

export function createThreeAdapterManifest() {
	return createAdapterCapabilityManifest({
		id: "adapter.three.buffer-geometry",
		version: "1.0.0",
		runtime: "three.injected",
		artifactTypes: ["animal-artifact", "geometry", "material", "mesh", "rig"],
		transports: ["in-memory"],
		deterministic: true,
		topologyIdentity: "unsupported",
		operations: [
			{ name: "adapter.three.geometry.materialize", status: "implemented" },
			{ name: "adapter.three.material.create", status: "partially-implemented" },
			{ name: "adapter.three.mesh.create", status: "implemented" },
			{ name: "adapter.three.rig.create", status: "partially-implemented" },
			{ name: "render.frame", status: "unsupported", determinism: "external" }
		],
		metadata: {
			rendererImportedByCore: false,
			threeNamespaceInjected: true
		}
	});
}
