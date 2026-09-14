//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import {
	NATIVE_GLES_ATOMIC_COUNTER_BUFFER,
	NATIVE_GLES_SHADER_STORAGE_BUFFER,
	NATIVE_GLES_TRANSFORM_FEEDBACK_BUFFER,
	NATIVE_GLES_UNIFORM_BUFFER
} from "./nativeGlesIndexedBufferTargets.js";

/** Registers indexed integer and integer64 binding/range queries. */
export function registerNativeGles3IndexedQueryHandlers(registry, vertexInput) {
	registry.register("glGetIntegeri_v", context => getIndexed(context, vertexInput, false));
	registry.register("glGetInteger64i_v", context => getIndexed(context, vertexInput, true));
}

function getIndexed(context, vertexInput, wide) {
	const pname = u32(context, 0);
	const index = u32(context, 1);
	const destination = readNativeGlesArgument(context, 2, 64);
	const thread = nativeGlesThreadValue(context);
	const query = vertexInput.buffers.domain.prepare(thread);
	const spec = indexedSpec(pname);
	if (query.valid && !spec) vertexInput.buffers.domain.invalidEnum(thread);
	const binding = query.valid && spec
		? vertexInput.indexed.binding(query.context, spec.target, index)
		: null;
	const value = spec ? indexedValue(binding, spec.field) : 0;
	if (query.valid && spec) {
		wide
			? writeInt64(context.memory, destination, value)
			: writeInt32(context.memory, destination, value);
	}
	finishNativeGlesVoid(context);
	return Object.freeze({ index, operation: wide ? "glGetInteger64i_v" : "glGetIntegeri_v", pname, success: query.valid && Boolean(spec), value });
}

function indexedSpec(pname) {
	const map = new Map([
		[0x8a28, spec(NATIVE_GLES_UNIFORM_BUFFER, "handle")],
		[0x8a29, spec(NATIVE_GLES_UNIFORM_BUFFER, "offset")],
		[0x8a2a, spec(NATIVE_GLES_UNIFORM_BUFFER, "size")],
		[0x8c8f, spec(NATIVE_GLES_TRANSFORM_FEEDBACK_BUFFER, "handle")],
		[0x8c84, spec(NATIVE_GLES_TRANSFORM_FEEDBACK_BUFFER, "offset")],
		[0x8c85, spec(NATIVE_GLES_TRANSFORM_FEEDBACK_BUFFER, "size")],
		[0x90d3, spec(NATIVE_GLES_SHADER_STORAGE_BUFFER, "handle")],
		[0x90d4, spec(NATIVE_GLES_SHADER_STORAGE_BUFFER, "offset")],
		[0x90d5, spec(NATIVE_GLES_SHADER_STORAGE_BUFFER, "size")],
		[0x92c1, spec(NATIVE_GLES_ATOMIC_COUNTER_BUFFER, "handle")],
		[0x92c2, spec(NATIVE_GLES_ATOMIC_COUNTER_BUFFER, "offset")],
		[0x92c3, spec(NATIVE_GLES_ATOMIC_COUNTER_BUFFER, "size")]
	]);
	return map.get(Number(pname)) || null;
}

function spec(target, field) {
	return Object.freeze({ field, target });
}

function indexedValue(binding, field) {
	if (!binding) return 0;
	if (field === "handle") return binding.record?.handle || 0;
	return Number(binding[field] || 0);
}

function u32(context, index) {
	return Number(readNativeGlesArgument(context, index, 32));
}

function writeInt32(memory, address, value) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setInt32(0, Number(value), true);
	memory.write(address, bytes);
}

function writeInt64(memory, address, value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigInt64(0, BigInt(value), true);
	memory.write(address, bytes);
}
