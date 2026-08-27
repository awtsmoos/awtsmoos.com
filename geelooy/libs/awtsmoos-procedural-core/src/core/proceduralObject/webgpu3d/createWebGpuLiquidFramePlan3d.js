// B"H
// Boruch Hashem
// Blessed is He
/** One bounded frame projects, curls, transfers FLIP deltas, emits surfaces, and stores history. */

import { createWebGpuComputePass3d } from "./createWebGpuComputePass3d.js";
import { createWebGpuPressurePasses3d } from "./createWebGpuPressurePasses3d.js";
import { createWebGpuVorticityPasses3d } from "./createWebGpuVorticityPasses3d.js";

function pass(id, entryPoint, elementCount, bindings, input) {
	return createWebGpuComputePass3d({
		id,
		shaderName: "awtsmoos-liquid-core",
		entryPoint,
		elementCount,
		workgroupSize: input.workgroupSize,
		bindings,
		enabled: input.enabledPasses?.includes(id) ?? true
	});
}

function basePasses(particleCount, gridCellCount, input) {
	return [
		pass("clear-grid", "clear_grid", gridCellCount, ["uniforms", "grid"], input),
		pass("deposit-particles", "deposit_particles", particleCount, [
			"uniforms", "particles-current", "grid"
		], input),
		pass("apply-grid-forces", "apply_grid_forces", gridCellCount, [
			"uniforms", "grid"
		], input),
		pass("normalize-grid", "normalize_grid", gridCellCount, [
			"uniforms", "grid", "grid-velocities"
		], input)
	];
}

export function createWebGpuLiquidFramePlan3d(input = {}) {
	const particleCount = Math.max(0, Math.floor(input.particleCount ?? 0));
	const gridCellCount = Math.max(0, Math.floor(input.gridCellCount ?? 0));
	const pressure = createWebGpuPressurePasses3d({ ...input, gridCellCount });
	const vorticity = createWebGpuVorticityPasses3d({ ...input, gridCellCount });
	const flipTransfer = pass(
		"transfer-grid-to-particles-flip",
		"transfer_grid_to_particles_flip",
		particleCount,
		[
			"uniforms", "particles-current", "particles-next", "surface-points",
			"grid-velocities", "previous-grid-velocities"
		],
		input
	);
	const history = pass(
		"store-grid-history",
		"store_grid_history",
		gridCellCount,
		["uniforms", "grid-velocities", "previous-grid-velocities"],
		input
	);
	const passes = Object.freeze([
		...basePasses(particleCount, gridCellCount, input),
		...pressure.passes,
		...vorticity,
		flipTransfer,
		history
	]);
	const enabledPasses = Object.freeze(passes.filter(candidate => candidate.enabled));
	const totalWorkgroups = enabledPasses.reduce((sum, candidate) => (
		sum + candidate.dispatch[0] * candidate.dispatch[1] * candidate.dispatch[2]
	), 0);
	const maximumWorkgroups = Math.max(0, Math.floor(
		input.maximumWorkgroups ?? Number.MAX_SAFE_INTEGER
	));
	if (totalWorkgroups > maximumWorkgroups) {
		throw new RangeError(
			`WebGPU frame workgroups exceed budget: ${totalWorkgroups} > ${maximumWorkgroups}`
		);
	}
	return Object.freeze({
		schema: "awtsmoos.webgpu-liquid-frame-plan-3d",
		frameIndex: Math.max(0, Math.floor(input.frameIndex ?? 0)),
		particleCount,
		gridCellCount,
		pressureIterations: pressure.pressureIterations,
		passes,
		enabledPasses,
		totalWorkgroups,
		submissionCount: enabledPasses.length > 0 ? 1 : 0
	});
}
