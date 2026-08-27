// B"H
// Boruch Hashem
// Blessed is He
/** One GPU frame writes uniforms, dispatches once, swaps buffers, and reads nothing back. */

import { createWebGpuLiquidFramePlan3d } from "./createWebGpuLiquidFramePlan3d.js";
import { encodeWebGpuLiquidFrame3d } from "./encodeWebGpuLiquidFrame3d.js";
import { packWebGpuLiquidUniforms3d } from "./packWebGpuLiquidUniforms3d.js";

export function stepWebGpuLiquidRuntimeFrame3d(context, state, input = {}) {
	const plan = createWebGpuLiquidFramePlan3d({
		frameIndex: state.frameIndex,
		particleCount: context.particleCount,
		gridCellCount: context.gridCellCount,
		maximumWorkgroups: context.maximumWorkgroups,
		enabledPasses: input.enabledPasses ?? context.defaultEnabledPasses
	});
	const uniforms = packWebGpuLiquidUniforms3d({
		...input,
		frameIndex: state.frameIndex,
		particleCount: context.particleCount,
		gridCellCount: context.gridCellCount,
		boundsMin: input.boundsMin ?? context.boundsMin,
		boundsMax: input.boundsMax ?? context.boundsMax
	});
	context.device.queue.writeBuffer(context.resources.uniformBuffer, 0, uniforms.bytes);
	const encoded = encodeWebGpuLiquidFrame3d({
		device: context.device,
		resources: context.resources,
		pipelineCache: context.pipelineCache,
		plan
	});
	context.resources.swap();
	return Object.freeze({
		ok: true,
		frameIndex: state.frameIndex,
		plan,
		parity: context.resources.parity,
		bytesAllocated: context.resources.totalBytes,
		pipelineCount: context.pipelineCache.pipelineCount,
		bindGroupCount: context.pipelineCache.bindGroupCount,
		computePassCount: encoded.computePassCount,
		submissionCount: encoded.submissionCount,
		readbackCount: 0,
		surfacePointBuffer: context.resources.surfacePointBuffer
	});
}
