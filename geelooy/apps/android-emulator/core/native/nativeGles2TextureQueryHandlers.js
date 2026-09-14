//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesValue, finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { writeNativeGlesFloat32Values, writeNativeGlesInt32Values } from "./nativeGlesQueryMemory.js";
import { getNativeGlesTextureParameterState } from "./nativeGlesTextureParameterState.js";
import { isNativeGlesScalarTextureParameter } from "./nativeGlesTextureParameterValues.js";

/** Registers GLES2 texture identity and scalar parameter queries. */
export function registerNativeGles2TextureQueryHandlers(registry, textures) {
	const parameters = getNativeGlesTextureParameterState(textures);
	registry.register("glIsTexture", context => isTexture(context, textures));
	registry.register("glGetTexParameterfv", context => query(context, textures, parameters, true));
	registry.register("glGetTexParameteriv", context => query(context, textures, parameters, false));
}

/** Reports GL_TRUE only for a generated texture that has actually been bound. */
function isTexture(context, textures) {
	const handle = Number(readNativeGlesArgument(context, 0, 32));
	const value = textures.is(handle, nativeGlesThreadValue(context)) ? 1 : 0;
	finishNativeGlesValue(context, value, 32);
	return Object.freeze({ handle, operation: "glIsTexture", success: true, value });
}

/** Reads one retained/default scalar parameter from the currently bound texture. */
function query(context, textures, parameters, floating) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const pname = Number(readNativeGlesArgument(context, 1, 32));
	const destination = readNativeGlesArgument(context, 2, 64);
	const thread = nativeGlesThreadValue(context);
	const bound = textures.bound(target, thread);
	let success = bound.success;
	if (success && !isNativeGlesScalarTextureParameter(pname)) {
		textures.domain.invalidEnum(thread);
		success = false;
	}
	const value = success
		? parameters.get(bound.context, bound.handle, target, pname)
		: undefined;
	if (success && value === undefined) {
		textures.domain.invalidEnum(thread);
		success = false;
	}
	if (success) {
		const writer = floating ? writeNativeGlesFloat32Values : writeNativeGlesInt32Values;
		writer(context.memory, destination, [value]);
	}
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: floating ? "glGetTexParameterfv" : "glGetTexParameteriv", pname, success, target, value });
}
