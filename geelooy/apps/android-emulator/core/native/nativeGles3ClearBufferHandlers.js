//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument, readNativeGlesSigned32 } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";

const COLOR = 0x1800;
const DEPTH = 0x1801;
const STENCIL = 0x1802;
const DEPTH_STENCIL = 0x84f9;

/**
 * Registers GLES3 typed clear-buffer entrypoints while retaining exact values in
 * the common pipeline command stream. Browser replay later supplies the matching
 * Int32Array/Uint32Array/Float32Array rather than weakening WebGL2 type semantics.
 */
export function registerNativeGles3ClearBufferHandlers(registry, pipeline) {
	registry.register("glClearBufferiv", context => clearVector(context, pipeline, "clearBufferiv", "i32"));
	registry.register("glClearBufferuiv", context => clearVector(context, pipeline, "clearBufferuiv", "u32"));
	registry.register("glClearBufferfv", context => clearVector(context, pipeline, "clearBufferfv", "f32"));
	registry.register("glClearBufferfi", context => clearDepthStencil(context, pipeline));
}

/** Reads and validates one typed pointer clear before tracing it. */
function clearVector(context, pipeline, method, kind) {
	const buffer = Number(readNativeGlesArgument(context, 0, 32));
	const drawbuffer = readNativeGlesSigned32(context, 1);
	const address = readNativeGlesArgument(context, 2, 64);
	const count = buffer === COLOR ? 4 : 1;
	const thread = nativeGlesThreadValue(context);
	let success = validVectorBuffer(buffer, kind);
	if (!success) pipeline.domain.invalidEnum(thread);
	const values = success ? readValues(context.memory, address, count, kind) : [];
	if (success) success = pipeline.command(method, [buffer, drawbuffer, values], thread).success;
	finishNativeGlesVoid(context);
	return Object.freeze({ buffer, drawbuffer, method, operation: `gl${upper(method)}`, success, values });
}

/** Reads glClearBufferfi's depth float and stencil integer from independent ABI streams. */
function clearDepthStencil(context, pipeline) {
	const buffer = Number(readNativeGlesArgument(context, 0, 32));
	const drawbuffer = readNativeGlesSigned32(context, 1);
	const depth = Number(context.registers.readFloat(0, 32));
	const stencil = readNativeGlesSigned32(context, 2);
	const thread = nativeGlesThreadValue(context);
	let success = buffer === DEPTH_STENCIL;
	if (!success) pipeline.domain.invalidEnum(thread);
	if (success) success = pipeline.command("clearBufferfi", [buffer, drawbuffer, depth, stencil], thread).success;
	finishNativeGlesVoid(context);
	return Object.freeze({ buffer, depth, drawbuffer, operation: "glClearBufferfi", stencil, success });
}

/** Implements the GLES3 legal buffer domain for each typed vector clear. */
function validVectorBuffer(buffer, kind) {
	if (kind === "u32") return buffer === COLOR;
	if (kind === "f32") return buffer === COLOR || buffer === DEPTH;
	return buffer === COLOR || buffer === STENCIL;
}

/** Reads one native pointer vector with exact scalar interpretation. */
function readValues(memory, address, count, kind) {
	const bytes = memory.read(address, count * 4);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	return Array.from({ length: count }, (_, index) => {
		if (kind === "f32") return view.getFloat32(index * 4, true);
		if (kind === "u32") return view.getUint32(index * 4, true);
		return view.getInt32(index * 4, true);
	});
}

function upper(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
