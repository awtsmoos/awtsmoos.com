// B"H
// Boruch Hashem
// Blessed is He
/** A resident GPU river advances through bounded dispatch without synchronous return. */

import { createWebGpuLiquidFramePlan3d } from "./createWebGpuLiquidFramePlan3d.js";
import { createWebGpuLiquidRuntimeState3d } from "./createWebGpuLiquidRuntimeState3d.js";
import { encodeWebGpuLiquidFrame3d } from "./encodeWebGpuLiquidFrame3d.js";
import { packWebGpuLiquidUniforms3d } from "./packWebGpuLiquidUniforms3d.js";

function structuredDeviceLoss(info) {
	return Object.freeze({
		reason: String(info?.reason ?? "unknown"),
		message: String(info?.message ?? "")
	});
}

export class WebGpuLiquidRuntime3d {
	#state;
	#frameIndex = 0;
	#lost = null;

	constructor(input) {
		this.#state = createWebGpuLiquidRuntimeState3d(input);
		const lost = this.#state.device.lost;
		if (lost && typeof lost.then === "function") {
			lost.then(info => { this.#lost = structuredDeviceLoss(info); }).catch(error => {
				this.#lost = structuredDeviceLoss({ reason: "promise-rejected", message: error?.message ?? String(error) });
			});
		}
	}

	stepFrame(input = {}) {
		if (this.#lost) {
			return Object.freeze({ ok: false, frameIndex: this.#frameIndex, lost: this.#lost, readbackCount: 0 });
		}
		const plan = createWebGpuLiquidFramePlan3d({
			frameIndex: this.#frameIndex,
			particleCount: this.#state.particleCount,
			gridCellCount: this.#state.gridCellCount,
			maximumWorkgroups: input.maximumWorkgroups ?? this.#state.maximumWorkgroups,
			enabledPasses: input.enabledPasses,
			workgroupSize: input.workgroupSize
		});
		const uniforms = packWebGpuLiquidUniforms3d({
			...input,
			frameIndex: this.#frameIndex,
			particleCount: this.#state.particleCount,
			gridCellCount: this.#state.gridCellCount,
			boundsMin: input.boundsMin ?? this.#state.boundsMin,
			boundsMax: input.boundsMax ?? this.#state.boundsMax,
			deltaTime: input.deltaTime ?? 1 / 60
		});
		this.#state.device.queue.writeBuffer(this.#state.resources.uniformBuffer, 0, uniforms.bytes);
		const encoded = encodeWebGpuLiquidFrame3d({
			device: this.#state.device,
			plan,
			resources: this.#state.resources,
			pipelines: this.#state.pipelines,
			bindGroups: this.#state.bindGroups
		});
		const report = Object.freeze({
			schema: "awtsmoos.webgpu-liquid-frame-report-3d",
			ok: true,
			frameIndex: this.#frameIndex,
			plan,
			parity: encoded.parityAfter,
			bytesAllocated: this.#state.resources.totalBytes,
			pipelineCount: encoded.pipelineCount,
			bindGroupCount: encoded.bindGroupCount,
			dispatchCount: encoded.dispatchCount,
			totalWorkgroups: encoded.totalWorkgroups,
			submissionCount: encoded.submissionCount,
			readbackCount: encoded.readbackCount,
			surfacePointBuffer: this.#state.resources.surfacePointBuffer
		});
		this.#frameIndex += 1;
		return report;
	}

	get frameIndex() { return this.#frameIndex; }
	get resources() { return this.#state.resources; }
	get capabilities() { return this.#state.capabilities; }
	get shaderManifest() { return this.#state.shaderManifest; }
	get lost() { return this.#lost; }
}
