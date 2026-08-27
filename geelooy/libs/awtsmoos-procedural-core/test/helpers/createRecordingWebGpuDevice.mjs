// B"H
// Boruch Hashem
// Blessed is He
/** A strict recording device proves GPU command shape without pretending to be hardware. */

export const RECORDING_GPU_BUFFER_USAGE = Object.freeze({
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

export const MOCK_GPU_BUFFER_USAGE = RECORDING_GPU_BUFFER_USAGE;

export function createRecordingWebGpuDevice() {
	const records = {
		buffers: [],
		writes: [],
		shaderModules: [],
		pipelines: [],
		bindGroups: [],
		encoders: [],
		computePasses: [],
		dispatches: [],
		submissions: []
	};
	let sequence = 0;
	const queue = {
		writeBuffer(buffer, offset, data) {
			records.writes.push({ buffer, offset, byteLength: data.byteLength });
		},
		submit(commandBuffers) {
			records.submissions.push([...commandBuffers]);
		}
	};
	const device = {
		features: new Set(["timestamp-query"]),
		limits: Object.freeze({ maxStorageBufferBindingSize: 256 * 1024 * 1024 }),
		queue,
		lost: new Promise(() => {}),
		createBuffer(descriptor) {
			const buffer = Object.freeze({ id: `buffer-${sequence += 1}`, descriptor });
			records.buffers.push(buffer);
			return buffer;
		},
		createShaderModule(descriptor) {
			const module = Object.freeze({ id: `shader-${sequence += 1}`, descriptor });
			records.shaderModules.push(module);
			return module;
		},
		createComputePipeline(descriptor) {
			const pipeline = Object.freeze({
				id: `pipeline-${sequence += 1}`,
				descriptor,
				getBindGroupLayout(index) {
					return Object.freeze({ pipelineId: this.id, index });
				}
			});
			records.pipelines.push(pipeline);
			return pipeline;
		},
		createBindGroup(descriptor) {
			const group = Object.freeze({ id: `group-${sequence += 1}`, descriptor });
			records.bindGroups.push(group);
			return group;
		},
		createCommandEncoder(descriptor) {
			const encoderRecord = { descriptor, passes: [], finished: false };
			records.encoders.push(encoderRecord);
			return {
				beginComputePass(passDescriptor) {
					const passRecord = {
						descriptor: passDescriptor,
						pipelines: [],
						bindGroups: [],
						dispatches: [],
						ended: false
					};
					encoderRecord.passes.push(passRecord);
					records.computePasses.push(passRecord);
					return {
						setPipeline(pipeline) { passRecord.pipelines.push(pipeline); },
						setBindGroup(index, group) { passRecord.bindGroups.push({ index, group }); },
						dispatchWorkgroups(x, y, z) {
							const dispatch = Object.freeze([x, y, z]);
							passRecord.dispatches.push(dispatch);
							records.dispatches.push(dispatch);
						},
						end() { passRecord.ended = true; }
					};
				},
				finish() {
					encoderRecord.finished = true;
					return Object.freeze({ id: `commands-${sequence += 1}`, encoderRecord });
				}
			};
		}
	};
	return Object.freeze({
		device,
		records,
		usageConstants: RECORDING_GPU_BUFFER_USAGE
	});
}
