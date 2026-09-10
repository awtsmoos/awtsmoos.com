//B"H //Boruch Hashem //Blessed is He 

import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";

const ARRAY_ALIASES = Object.freeze([
	"glDrawArraysInstanced",
	"glDrawArraysInstancedANGLE",
	"glDrawArraysInstancedEXT"
]);
const ELEMENT_ALIASES = Object.freeze([
	"glDrawElementsInstanced",
	"glDrawElementsInstancedANGLE",
	"glDrawElementsInstancedEXT"
]);

/**
 * Registers direct core and instanced GLES draw ABI roads against one draw state.
 * The Awtsmoos.com runtime keeps extension aliases semantically identical while
 * indirect and base-instance calls remain unregistered until truthfully lowered.
 *
 * @param {object} registry Native host-import registry.
 * @param {object} state Validated native draw state.
 */
export function registerNativeGlesDrawHandlers(registry, state) {
	registry.register("glDrawArrays", context => drawArrays(context, state, false));
	for (const name of ARRAY_ALIASES) {
		registry.register(name, context => drawArrays(context, state, true, name));
	}
	registry.register("glDrawElements", context => drawElements(context, state, false));
	for (const name of ELEMENT_ALIASES) {
		registry.register(name, context => drawElements(context, state, true, name));
	}
	registry.register("glDrawRangeElements", context => drawRangeElements(context, state));
}

/** Executes array draws and their direct instanced aliases. */
function drawArrays(context, state, instanced, operation = "glDrawArrays") {
	const mode = Number(context.registers.read(0, 32, "zero"));
	const first = signed32(context.registers.read(1, 32, "zero"));
	const count = signed32(context.registers.read(2, 32, "zero"));
	const instances = instanced
		? signed32(context.registers.read(3, 32, "zero"))
		: null;
	const success = state.arrays(
		mode,
		first,
		count,
		instances,
		nativeGlesThreadValue(context),
		instanced ? "draw-arrays-instanced" : "draw-arrays"
	);
	finishNativeGlesVoid(context);
	return Object.freeze({ count, first, instances, mode, operation, success });
}

/** Executes indexed draws and preserves guest byte offsets for WebGL2 replay. */
function drawElements(context, state, instanced, operation = "glDrawElements") {
	const mode = Number(context.registers.read(0, 32, "zero"));
	const count = signed32(context.registers.read(1, 32, "zero"));
	const type = Number(context.registers.read(2, 32, "zero"));
	const offset = context.registers.read(3, 64, "zero");
	const instances = instanced
		? signed32(context.registers.read(4, 32, "zero"))
		: null;
	const success = state.elements(
		mode,
		count,
		type,
		offset,
		instances,
		null,
		nativeGlesThreadValue(context),
		instanced ? "draw-elements-instanced" : "draw-elements"
	);
	finishNativeGlesVoid(context);
	return Object.freeze({ count, instances, mode, offset: offset.toString(), operation, success, type });
}

/** Executes GLES range-element draws with unsigned range metadata. */
function drawRangeElements(context, state) {
	const mode = Number(context.registers.read(0, 32, "zero"));
	const start = Number(context.registers.read(1, 32, "zero"));
	const end = Number(context.registers.read(2, 32, "zero"));
	const count = signed32(context.registers.read(3, 32, "zero"));
	const type = Number(context.registers.read(4, 32, "zero"));
	const offset = context.registers.read(5, 64, "zero");
	const success = state.elements(
		mode,
		count,
		type,
		offset,
		null,
		Object.freeze({ end, start }),
		nativeGlesThreadValue(context),
		"draw-range-elements"
	);
	finishNativeGlesVoid(context);
	return Object.freeze({ count, end, mode, offset: offset.toString(), operation: "glDrawRangeElements", start, success, type });
}

/** Restores a signed C GLint/GLsizei from one 32-bit AAPCS64 register. */
function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
