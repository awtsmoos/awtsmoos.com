// B"H
// Boruch Hashem
// Blessed is He
/** Two bounded grid passes reveal curl and restore rotational energy before FLIP transfer. */

import { createWebGpuComputePass3d } from "./createWebGpuComputePass3d.js";

function pass(id, entryPoint, input) {
	return createWebGpuComputePass3d({
		id,
		shaderName: "awtsmoos-liquid-core",
		entryPoint,
		elementCount: input.gridCellCount,
		workgroupSize: input.workgroupSize,
		bindings: ["uniforms", "grid-velocities", "vorticity"],
		enabled: input.enabledPasses?.includes(id) ?? true
	});
}

export function createWebGpuVorticityPasses3d(input) {
	return Object.freeze([
		pass("compute-vorticity", "compute_vorticity", input),
		pass(
			"apply-vorticity-confinement",
			"apply_vorticity_confinement",
			input
		)
	]);
}
