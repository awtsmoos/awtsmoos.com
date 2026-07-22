// B"H
// Boruch Hashem
// Blessed is He
/** One GPU frame plan orders bounded compute work without CPU readback. */

import { createWebGpuComputePass3d } from "./createWebGpuComputePass3d.js";

function computePass(id, entryPoint, elementCount, bindings, input) {
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

export function createWebGpuLiquidFramePlan3d(input = {}) {
	const particleCount = Math.max(0, Math.floor(input.particleCount ?? 0));
	const gridCellCount = Math.max(0, Math.floor(input.gridCellCount ?? 0));
	const passes = Object.freeze([
		computePass("clear-grid", "clear_grid", gridCellCount, ["uniforms", "grid"], input),
		computePass("apply-grid-forces", "apply_grid_forces", gridCellCount, ["uniforms", "grid"], input),
		computePass("integrate-particles", "integrate_particles", particleCount, [
			"uniforms", "particles-current", "particles-next"
		], input),
		computePass("pack-surface-points", "pack_surface_points", particleCount, [
			"uniforms", "particles-next", "surface-points"
		], input)
	]);
	const enabledPasses = Object.freeze(passes.filter(pass => pass.enabled));
	const totalWorkgroups = enabledPasses.reduce((sum, pass) => (
		sum + pass.dispatch[0] * pass.dispatch[1] * pass.dispatch[2]
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
		passes,
		enabledPasses,
		totalWorkgroups,
		submissionCount: enabledPasses.length > 0 ? 1 : 0
	});
}
