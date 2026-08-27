// B"H
// Boruch Hashem
// Blessed is He
/** Pipelines and parity-aware bind groups are compiled once and reused across frames. */

import { createWebGpuBindGroup3d } from "./createWebGpuBindGroup3d.js";

export class WebGpuLiquidPipelineCache3d {
	#device;
	#shaderModule;
	#pipelines = new Map();
	#bindGroups = new Map();

	constructor(device, shaderModule) {
		this.#device = device;
		this.#shaderModule = shaderModule;
	}

	pipeline(entryPoint) {
		if (!this.#pipelines.has(entryPoint)) {
			this.#pipelines.set(entryPoint, this.#device.createComputePipeline({
				label: `awtsmoos-pipeline-${entryPoint}`,
				layout: "auto",
				compute: Object.freeze({
					module: this.#shaderModule,
					entryPoint
				})
			}));
		}
		return this.#pipelines.get(entryPoint);
	}

	bindGroup(entryPoint, resources) {
		const key = `${entryPoint}:${resources.parity}`;
		if (!this.#bindGroups.has(key)) {
			const pipeline = this.pipeline(entryPoint);
			this.#bindGroups.set(key, createWebGpuBindGroup3d(
				this.#device,
				pipeline,
				entryPoint,
				resources
			));
		}
		return this.#bindGroups.get(key);
	}

	get pipelineCount() {
		return this.#pipelines.size;
	}

	get bindGroupCount() {
		return this.#bindGroups.size;
	}
}
