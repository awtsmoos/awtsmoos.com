//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument, readNativeGlesSigned32 } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";

/**
 * Registers layered texture attachment for GLES3 3D/array texture framebuffers.
 * The state record retains both mip level and layer so WebGL2 replay can call
 * framebufferTextureLayer without inferring either value from unrelated state.
 */
export function registerNativeGles3FramebufferLayerHandlers(registry, framebuffers) {
	registry.register("glFramebufferTextureLayer", context => attachLayer(context, framebuffers));
}

/** Decodes and validates one layered attachment through the framebuffer state. */
function attachLayer(context, framebuffers) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const attachment = Number(readNativeGlesArgument(context, 1, 32));
	const texture = Number(readNativeGlesArgument(context, 2, 32));
	const level = readNativeGlesSigned32(context, 3);
	const layer = readNativeGlesSigned32(context, 4);
	const success = framebuffers.attachTextureLayer(
		target,
		attachment,
		texture,
		level,
		layer,
		nativeGlesThreadValue(context)
	);
	finishNativeGlesVoid(context);
	return Object.freeze({ attachment, layer, level, operation: "glFramebufferTextureLayer", success, target, texture });
}
