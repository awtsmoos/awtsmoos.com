// B"H
// Boruch Hashem
// Blessed is He
/** One GPU plan clears, deposits, forces, normalizes, and performs fused PIC output. */

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
		computePass("clear-grid", "clear_grid", gridCellCount, [
			"uniforms", "grid"
		], input),
		computePass("deposit-particles", "deposit_particles", particleCount, [
			"uniforms", "particles-current", "grid"
		], input),
		computePass("apply-grid-forces", "apply_grid_forces", gridCellCount, [
			"uniforms", "grid"
		], input),
		computePass("normalize-grid", "normalize_grid", gridCellCount, [
			"uniforms", "grid", "grid-velocities"
		], input),
		computePass("transfer-grid-to-particles", "transfer_grid_to_particles", particleCount, [
			"uniforms", "particles-current", "particles-next",
			"grid-velocities", "surface-points"
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
