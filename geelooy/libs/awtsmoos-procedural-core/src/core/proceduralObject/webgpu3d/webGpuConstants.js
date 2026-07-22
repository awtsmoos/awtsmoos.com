// B"H
// Boruch Hashem
// Blessed is He
/** WebGPU symbolic constants remain host-neutral until a device boundary resolves them. */

export const WEB_GPU_BUFFER_USAGE_NAMES = Object.freeze([
	"MAP_READ", "MAP_WRITE", "COPY_SRC", "COPY_DST", "INDEX", "VERTEX",
	"UNIFORM", "STORAGE", "INDIRECT", "QUERY_RESOLVE"
]);

export const WEB_GPU_PARTICLE_STRIDE_BYTES = 48;
export const WEB_GPU_UNIFORM_BUFFER_BYTES = 256;
export const WEB_GPU_DEFAULT_WORKGROUP_SIZE = 64;

export function alignWebGpuBytes(value, alignment = 4) {
	const bytes = Math.max(0, Math.ceil(Number(value)));
	const multiple = Math.max(1, Math.ceil(Number(alignment)));
	if (![bytes, multiple].every(Number.isFinite)) {
		throw new TypeError("WebGPU byte values must be finite.");
	}
	return Math.ceil(bytes / multiple) * multiple;
}

export function normalizeWebGpuUsageNames(values) {
	if (!Array.isArray(values) || values.length === 0) {
		throw new TypeError("WebGPU usage names must be a nonempty array.");
	}
	const names = [...new Set(values.map(String))].sort();
	for (const name of names) {
		if (!WEB_GPU_BUFFER_USAGE_NAMES.includes(name)) {
			throw new TypeError(`Unsupported WebGPU buffer usage name: ${name}`);
		}
	}
	return Object.freeze(names);
}

export function resolveWebGpuUsageBits(names, constants = globalThis.GPUBufferUsage) {
	if (!constants) {
		throw new Error("GPUBufferUsage constants must be supplied by the WebGPU host.");
	}
	return normalizeWebGpuUsageNames(names).reduce((bits, name) => {
		const value = constants[name];
		if (!Number.isInteger(value)) {
			throw new TypeError(`GPUBufferUsage constant is unavailable: ${name}`);
		}
		return bits | value;
	}, 0);
}
