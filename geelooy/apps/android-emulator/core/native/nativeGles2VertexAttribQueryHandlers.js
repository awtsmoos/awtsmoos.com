//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { getNativeGles2VertexAttribState } from "./nativeGles2VertexAttribState.js";
import {
	writeNativeGlesFloat32Values,
	writeNativeGlesInt32Values
} from "./nativeGlesQueryMemory.js";

const ARRAY_POINTER = 0x8645;
const CURRENT_VALUE = 0x8626;
const MAX_ATTRIBUTES = 16;

/** Registers GLES2 vertex attribute value, array-state, and pointer queries. */
export function registerNativeGles2VertexAttribQueryHandlers(registry, vertexInput, runtimeState) {
	const generic = getNativeGles2VertexAttribState(vertexInput);
	registry.register(
		"glGetVertexAttribfv",
		context => getAttrib(context, vertexInput, generic, runtimeState, true)
	);
	registry.register(
		"glGetVertexAttribiv",
		context => getAttrib(context, vertexInput, generic, runtimeState, false)
	);
	registry.register(
		"glGetVertexAttribPointerv",
		context => getPointer(context, vertexInput, runtimeState)
	);
}

/** Writes one current or array-backed vertex attribute property. */
function getAttrib(context, vertexInput, generic, runtimeState, floating) {
	const index = Number(readNativeGlesArgument(context, 0, 32));
	const pname = Number(readNativeGlesArgument(context, 1, 32));
	const destination = readNativeGlesArgument(context, 2, 64);
	const outcome = attributeOutcome(
		vertexInput,
		generic,
		index,
		pname,
		runtimeState,
		nativeGlesThreadValue(context)
	);
	if (outcome.success) {
		const writer = floating
			? writeNativeGlesFloat32Values
			: writeNativeGlesInt32Values;
		writer(context.memory, destination, outcome.values);
	}
	finishNativeGlesVoid(context);
	return Object.freeze({ index, pname, success: outcome.success });
}

/** Returns the stored pointer offset for GL_VERTEX_ATTRIB_ARRAY_POINTER. */
function getPointer(context, vertexInput, runtimeState) {
	const index = Number(readNativeGlesArgument(context, 0, 32));
	const pname = Number(readNativeGlesArgument(context, 1, 32));
	const destination = readNativeGlesArgument(context, 2, 64);
	const thread = nativeGlesThreadValue(context);
	const outcome = attributeOutcome(vertexInput, null, index, pname, runtimeState, thread);
	const success = outcome.success && pname === ARRAY_POINTER;
	if (outcome.success && !success) vertexInput.buffers.domain.invalidEnum(thread);
	if (success) writePointer(context.memory, destination, BigInt(outcome.values[0] || 0));
	finishNativeGlesVoid(context);
	return Object.freeze({ index, operation: "glGetVertexAttribPointerv", pname, success });
}

/** Resolves one GLES2 vertex attribute property from the current VAO. */
function attributeOutcome(vertexInput, generic, index, pname, runtimeState, thread) {
	const query = vertexInput.buffers.domain.prepare(thread);
	if (!query.valid) return { success: false, values: [] };
	if (!validIndex(index, runtimeState)) {
		vertexInput.buffers.domain.invalidValue(thread);
		return { success: false, values: [] };
	}
	if (pname === CURRENT_VALUE && generic) {
		return { success: true, values: generic.get(query.context, index) };
	}
	const record = vertexInput.contexts
		.get(query.context)
		.currentVao.attributes.get(index) || {};
	const values = arrayProperty(record, pname);
	if (!values) vertexInput.buffers.domain.invalidEnum(thread);
	return { success: Boolean(values), values: values || [] };
}

/** Maps GLES vertex array query tokens to deterministic defaults and retained state. */
function arrayProperty(record, pname) {
	if (pname === 0x8622) return [record.enabled ? 1 : 0];
	if (pname === 0x8623) return [record.size ?? 4];
	if (pname === 0x8624) return [record.stride ?? 0];
	if (pname === 0x8625) return [record.type ?? 0x1406];
	if (pname === 0x886a) return [record.normalized ? 1 : 0];
	if (pname === 0x889f) return [record.buffer?.handle ?? 0];
	if (pname === ARRAY_POINTER) return [record.offset ?? 0];
	return null;
}

/** Uses the runtime-advertised attribute limit when present. */
function validIndex(index, runtimeState) {
	return index >= 0
		&& index < Number(runtimeState.nativeGlesMaxVertexAttribs || MAX_ATTRIBUTES);
}

/** Writes one native pointer-sized little-endian guest value. */
function writePointer(memory, address, value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigUint64(0, value, true);
	memory.write(address, bytes);
}
