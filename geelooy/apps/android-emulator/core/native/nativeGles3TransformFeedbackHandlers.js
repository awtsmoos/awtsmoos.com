//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument, readNativeGlesSigned32 } from "./nativeGlesArguments.js";
import { finishNativeGlesValue, finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { readNativeGlesNames, writeNativeGlesNames } from "./nativeGlesNameArray.js";

/** Registers transform-feedback object lifecycle, capture, pause, and resume APIs. */
export function registerNativeGles3TransformFeedbackHandlers(registry, state) {
	registry.register("glBindTransformFeedback", context => bind(context, state));
	registry.register("glDeleteTransformFeedbacks", context => remove(context, state));
	registry.register("glGenTransformFeedbacks", context => generate(context, state));
	registry.register("glIsTransformFeedback", context => isObject(context, state));
	registry.register("glBeginTransformFeedback", context => begin(context, state));
	registry.register("glEndTransformFeedback", context => end(context, state));
	registry.register("glPauseTransformFeedback", context => pause(context, state));
	registry.register("glResumeTransformFeedback", context => resume(context, state));
}

function bind(context, state) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const handle = Number(readNativeGlesArgument(context, 1, 32));
	const success = state.bind(target, handle, nativeGlesThreadValue(context));
	return finish(context, "glBindTransformFeedback", success, { handle, target });
}
function remove(context, state) {
	const count = readNativeGlesSigned32(context, 0);
	const address = readNativeGlesArgument(context, 1, 64);
	if (count < 0) return failCount(context, state, count);
	const names = readNativeGlesNames(context.memory, address, count);
	const success = state.delete(names, nativeGlesThreadValue(context));
	return finish(context, "glDeleteTransformFeedbacks", success, { count, names });
}
function generate(context, state) {
	const count = readNativeGlesSigned32(context, 0);
	const address = readNativeGlesArgument(context, 1, 64);
	if (count < 0) return failCount(context, state, count);
	const result = state.generate(count, nativeGlesThreadValue(context));
	if (result.success && count) writeNativeGlesNames(context.memory, address, result.names);
	return finish(context, "glGenTransformFeedbacks", result.success, { count, names: result.names });
}
function isObject(context, state) {
	const handle = Number(readNativeGlesArgument(context, 0, 32));
	const value = state.is(handle, nativeGlesThreadValue(context)) ? 1 : 0;
	finishNativeGlesValue(context, value, 32);
	return Object.freeze({ handle, operation: "glIsTransformFeedback", success: true, value });
}
function begin(context, state) {
	const mode = Number(readNativeGlesArgument(context, 0, 32));
	return finish(context, "glBeginTransformFeedback", state.begin(mode, nativeGlesThreadValue(context)), { mode });
}
function end(context, state) { return finish(context, "glEndTransformFeedback", state.end(nativeGlesThreadValue(context)), {}); }
function pause(context, state) { return finish(context, "glPauseTransformFeedback", state.pause(nativeGlesThreadValue(context)), {}); }
function resume(context, state) { return finish(context, "glResumeTransformFeedback", state.resume(nativeGlesThreadValue(context)), {}); }
function finish(context, operation, success, values) { finishNativeGlesVoid(context); return Object.freeze({ operation, success, ...values }); }
function failCount(context, state, count) { state.domain.invalidValue(nativeGlesThreadValue(context)); return finish(context, "transform-feedback-count", false, { count }); }
