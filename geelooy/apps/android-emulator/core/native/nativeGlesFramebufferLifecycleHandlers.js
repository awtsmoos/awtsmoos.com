//B"H
//Boruch Hashem
//Blessed is He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesValue, finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { readNativeGlesNames, writeNativeGlesNames } from "./nativeGlesNameArray.js";

/** Registers FBO/RBO generation, deletion, binding, and predicates through exact guest memory. */
export function registerNativeGlesFramebufferLifecycleHandlers(registry, state) {
	registerFamily(registry, state, "Framebuffer");
	registerFamily(registry, state, "Renderbuffer");
}

/** Registers one container family without duplicating its four ABI entrypoints. */
function registerFamily(registry, state, family) {
	registry.register(`glBind${family}`, context => bind(context, state, family));
	registry.register(`glDelete${family}s`, context => remove(context, state, family));
	registry.register(`glGen${family}s`, context => generate(context, state, family));
	registry.register(`glIs${family}`, context => isObject(context, state, family));
}

/** Binds one guest GLuint container name to its GLenum target. */
function bind(context, state, family) {
	const target = u32(context, 0);
	const handle = u32(context, 1);
	const method = family === "Framebuffer" ? "bindFramebuffer" : "bindRenderbuffer";
	const success = state[method](target, handle, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ handle, operation: `glBind${family}`, success, target });
}

/** Generates names and writes exact little-endian GLuint values into guest memory. */
function generate(context, state, family) {
	const count = signed32(readNativeGlesArgument(context, 0, 32));
	const address = readNativeGlesArgument(context, 1, 64);
	if (count < 0) return invalidCount(context, state, `glGen${family}s`, count);
	const outcome = state[`generate${family}s`](count, nativeGlesThreadValue(context));
	if (outcome.success && count > 0) writeNativeGlesNames(context.memory, address, outcome.names);
	finishNativeGlesVoid(context);
	return Object.freeze({ count, names: outcome.names, operation: `glGen${family}s`, success: outcome.success });
}

/** Deletes a guest-provided GLuint array while zero and unknown names remain harmless. */
function remove(context, state, family) {
	const count = signed32(readNativeGlesArgument(context, 0, 32));
	const address = readNativeGlesArgument(context, 1, 64);
	if (count < 0) return invalidCount(context, state, `glDelete${family}s`, count);
	const names = readNativeGlesNames(context.memory, address, count);
	const success = state[`delete${family}s`](names, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ count, names, operation: `glDelete${family}s`, success });
}

/** Returns GL_TRUE only for a generated object that has been bound/created. */
function isObject(context, state, family) {
	const handle = u32(context, 0);
	const value = state[`is${family}`](handle, nativeGlesThreadValue(context)) ? 1 : 0;
	finishNativeGlesValue(context, value, 32);
	return Object.freeze({ handle, operation: `glIs${family}`, result: value, success: true });
}

/** Sets INVALID_VALUE for a negative GLsizei before any guest pointer is dereferenced. */
function invalidCount(context, state, operation, count) {
	state.domain.invalidValue(nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ count, operation, success: false });
}

/** Reads one unsigned 32-bit GLenum/GLuint argument. */
function u32(context, index) { return Number(readNativeGlesArgument(context, index, 32)); }

/** Interprets one GLsizei using signed two's-complement semantics. */
function signed32(value) { return Number(BigInt.asIntN(32, BigInt(value))); }
