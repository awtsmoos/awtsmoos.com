//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { getNativeGles2VertexAttribState } from "./nativeGles2VertexAttribState.js";

const MAX_ATTRIBUTES = 16;

/** Registers GLES2 generic immediate and pointer-based vertex attribute setters. */
export function registerNativeGles2VertexAttribHandlers(registry, vertexInput, runtimeState) {
	const generic = getNativeGles2VertexAttribState(vertexInput);
	for (let count = 1; count <= 4; count += 1) {
		registry.register(
			`glVertexAttrib${count}f`,
			context => setImmediate(context, vertexInput, generic, count, runtimeState)
		);
		registry.register(
			`glVertexAttrib${count}fv`,
			context => setPointer(context, vertexInput, generic, count, runtimeState)
		);
	}
}

/** Stores an immediate 1-4 component float vector with GLES default fill lanes. */
function setImmediate(context, vertexInput, generic, count, runtimeState) {
	const index = Number(readNativeGlesArgument(context, 0, 32));
	const values = [];
	for (let lane = 0; lane < count; lane += 1) {
		values.push(context.registers.readFloat(lane, 32));
	}
	return store(context, vertexInput, generic, index, normalized(values), runtimeState);
}

/** Reads a guest float vector and stores one current generic attribute value. */
function setPointer(context, vertexInput, generic, count, runtimeState) {
	const index = Number(readNativeGlesArgument(context, 0, 32));
	const address = readNativeGlesArgument(context, 1, 64);
	const bytes = context.memory.read(address, count * 4);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const values = Array.from(
		{ length: count },
		(_, lane) => view.getFloat32(lane * 4, true)
	);
	return store(context, vertexInput, generic, index, normalized(values), runtimeState);
}

/** Validates the attribute index and completes the guest void-return ABI. */
function store(context, vertexInput, generic, index, values, runtimeState) {
	const thread = nativeGlesThreadValue(context);
	const query = vertexInput.buffers.domain.prepare(thread);
	const success = query.valid && validIndex(index, runtimeState);
	if (query.valid && !success) vertexInput.buffers.domain.invalidValue(thread);
	if (success) generic.set(query.context, index, values);
	finishNativeGlesVoid(context);
	return Object.freeze({ index, operation: "glVertexAttrib*f", success, values });
}

/** Returns a four-lane generic value with GLES default fill semantics. */
function normalized(values) {
	return [
		values[0] ?? 0,
		values[1] ?? 0,
		values[2] ?? 0,
		values[3] ?? 1
	];
}

/** Uses the runtime-advertised attribute limit when present. */
function validIndex(index, runtimeState) {
	return index >= 0
		&& index < Number(runtimeState.nativeGlesMaxVertexAttribs || MAX_ATTRIBUTES);
}
