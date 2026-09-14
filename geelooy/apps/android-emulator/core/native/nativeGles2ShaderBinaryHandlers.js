//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesSigned32 } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";

/**
 * Registers glShaderBinary for an implementation exposing zero binary formats.
 * Source shaders remain fully supported; binary upload therefore rejects every
 * binary-format enum without reading the guest shader array or binary pointer.
 */
export function registerNativeGles2ShaderBinaryHandlers(registry, objects) {
	registry.register("glShaderBinary", context => shaderBinary(context, objects));
}

/** Applies GLES count validation before the deterministic unsupported-format error. */
function shaderBinary(context, objects) {
	const count = readNativeGlesSigned32(context, 0);
	const thread = nativeGlesThreadValue(context);
	if (count < 0) objects.domain.invalidValue(thread);
	else objects.domain.invalidEnum(thread);
	finishNativeGlesVoid(context);
	return Object.freeze({ count, operation: "glShaderBinary", success: false });
}
