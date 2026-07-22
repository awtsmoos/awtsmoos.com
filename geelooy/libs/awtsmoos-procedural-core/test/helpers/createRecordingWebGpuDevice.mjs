// B"H
// Boruch Hashem
// Blessed is He
/** A strict recording device proves WebGPU command behavior without pretending to be hardware. */

export const MOCK_GPU_BUFFER_USAGE = Object.freeze({
	MAP_READ: 1,
	MAP_WRITE: 2,
	COPY_SRC: 4,
	COPY_DST: 8,
	INDEX: 16,
	VERTEX: 32,
	UNIFORM: 64,
	STORAGE: 128,
	INDIRECT: 256,
	QUERY_RESOLVE: 512
});

export function createRecordingWebGpuDevice() {
	const calls = {
		buffers: [],
		writeBuffers: [],
		shaderModules: [],
		pipelines: [],
		bindGroups: [],
		encoders: [],
		computePasses: [],
		pipelineSets: [],
		bindGroupSets: [],
		dispatches: [],
		submissions: [],
		mapAsyncCount: 0
	};
	let bufferId = 0;
	let pipelineId = 0;
	let bindGroupId = 0;
	let resolveLost;
	const lost = new Promise(resolve => {
		resolveLost = resolve;
	});
	const queue = {
		writeBuffer(buffer, offset, data) {
			calls.writeBuffers.push({ buffer, offset, byteLength: data.byteLength });
		},
		submit(commandBuffers) {
			calls.submissions.push([...commandBuffers]);
		}
	};
	const device = {
		features: new Set(["timestamp-query"]),
		limits: Object.freeze({ maxStorageBufferBindingSize: 128 * 1024 * 1024 }),
		lost,
		queue,
		createBuffer(descriptor) {
			const buffer = {
				id: `buffer-${bufferId += 1}`,
				...descriptor,
				mapAsync() {
					calls.mapAsyncCount += 1;
					return Promise.resolve();
				}
			};
			calls.buffers.push(buffer);
			return buffer;
		},
		createShaderModule(descriptor) {
			const module = { descriptor };
			calls.shaderModules.push(module);
			return module;
		},
		createComputePipeline(descriptor) {
			const pipeline = {
				id: `pipeline-${pipelineId += 1}`,
				descriptor,
				getBindGroupLayout(index) {
					return { pipelineId: pipeline.id, index };
				}
			};
			calls.pipelines.push(pipeline);
			return pipeline;
		},
		createBindGroup(descriptor) {
			const bindGroup = {
				id: `bind-group-${bindGroupId += 1}`,
				descriptor
			};
			calls.bindGroups.push(bindGroup);
			return bindGroup;
		},
		createCommandEncoder(descriptor) {
			const encoder = { descriptor, passCount: 0, finished: false };
			calls.encoders.push(encoder);
			return {
				beginComputePass(passDescriptor) {
					const passIndex = calls.computePasses.length;
					const pass = { passIndex, descriptor: passDescriptor, ended: false };
					calls.computePasses.push(pass);
					encoder.passCount += 1;
					return {
						setPipeline(pipeline) {
							calls.pipelineSets.push({ passIndex, pipelineId: pipeline.id });
						},
						setBindGroup(index, bindGroup) {
							calls.bindGroupSets.push({ passIndex, index, bindGroupId: bindGroup.id });
						},
						dispatchWorkgroups(...workgroups) {
							calls.dispatches.push({ passIndex, workgroups });
						},
						end() {
							pass.ended = true;
						}
					};
				},
				finish() {
					encoder.finished = true;
					return { encoder };
				}
			};
		}
	};
	return Object.freeze({
		device,
		calls,
		usageConstants: MOCK_GPU_BUFFER_USAGE,
		lose(info = {}) {
			resolveLost(info);
		}
	});
}
