// B"H
// Boruch Hashem
// Blessed is He
/** One shader vessel unfolds into cached compute pipelines without per-frame rebirth. */

export class WebGpuPipelineCache3d {
	#device;
	#shaderModule;
	#pipelines = new Map();

	constructor(input) {
		if (!input?.device || typeof input.device.createComputePipeline !== "function") {
			throw new TypeError("WebGPU pipeline cache requires a GPUDevice-like object.");
		}
		if (!input.shaderModule) {
			throw new TypeError("WebGPU pipeline cache requires a shader module.");
		}
		this.#device = input.device;
		this.#shaderModule = input.shaderModule;
	}

	get(entryPoint) {
		const name = String(entryPoint);
		if (!this.#pipelines.has(name)) {
			this.#pipelines.set(name, this.#device.createComputePipeline({
				label: `awtsmoos-liquid-pipeline-${name}`,
				layout: "auto",
				compute: Object.freeze({ module: this.#shaderModule, entryPoint: name })
			}));
		}
		return this.#pipelines.get(name);
	}

	has(entryPoint) { return this.#pipelines.has(String(entryPoint)); }
	get size() { return this.#pipelines.size; }
}
