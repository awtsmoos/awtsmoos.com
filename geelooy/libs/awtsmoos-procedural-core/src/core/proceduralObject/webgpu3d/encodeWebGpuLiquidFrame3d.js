// B"H
// Boruch Hashem
// Blessed is He
/** One command buffer caches static grid bindings and parity-sensitive particle bindings. */

import { createWebGpuBindGroup3d } from "./createWebGpuBindGroup3d.js";

const PARITY_SENSITIVE_ENTRY_POINTS = new Set([
	"deposit_particles",
	"transfer_grid_to_particles",
	"integrate_particles",
	"pack_surface_points"
]);

function bindGroupKey(pass, resources) {
	return PARITY_SENSITIVE_ENTRY_POINTS.has(pass.entryPoint)
		? `${pass.entryPoint}:${resources.parity}`
		: pass.entryPoint;
}

function resolveBindGroup(input, pass, pipeline) {
	const key = bindGroupKey(pass, input.resources);
	if (!input.bindGroups.has(key)) {
		input.bindGroups.set(key, createWebGpuBindGroup3d(
			input.device,
			pipeline,
			pass.entryPoint,
			input.resources
		));
	}
	return input.bindGroups.get(key);
}

export function encodeWebGpuLiquidFrame3d(input) {
	if (!input?.device || typeof input.device.createCommandEncoder !== "function") {
		throw new TypeError("WebGPU frame encoding requires a GPUDevice-like object.");
	}
	if (!(input.bindGroups instanceof Map)) {
		throw new TypeError("WebGPU frame encoding requires a bind-group cache.");
	}
	const encoder = input.device.createCommandEncoder({
		label: `awtsmoos-liquid-frame-${input.plan.frameIndex}`
	});
	let dispatchCount = 0;
	if (input.plan.enabledPasses.length > 0) {
		const compute = encoder.beginComputePass({
			label: "awtsmoos-liquid-compute"
		});
		for (const pass of input.plan.enabledPasses) {
			const pipeline = input.pipelines.get(pass.entryPoint);
			compute.setPipeline(pipeline);
			compute.setBindGroup(0, resolveBindGroup(input, pass, pipeline));
			compute.dispatchWorkgroups(...pass.dispatch);
			dispatchCount += 1;
		}
		compute.end();
	}
	const commandBuffer = encoder.finish();
	if (input.plan.submissionCount > 0) {
		input.device.queue.submit([commandBuffer]);
	}
	const parityBefore = input.resources.parity;
	const parityAfter = input.resources.swap();
	return Object.freeze({
		commandBuffer,
		dispatchCount,
		totalWorkgroups: input.plan.totalWorkgroups,
		submissionCount: input.plan.submissionCount,
		parityBefore,
		parityAfter,
		pipelineCount: input.pipelines.size,
		bindGroupCount: input.bindGroups.size,
		readbackCount: 0
	});
}
