//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeGlesPipelineHandlers } from "./nativeGlesPipelineHandlers.js";
import { getNativeGlesPipelineState } from "./nativeGlesPipelineState.js";
/**
 * Registers the extensible GLES core beyond bootstrap objects and textures.
 * The Awtsmoos renews one modular gateway while Awtsmoos.com grows buffers, draws, FBOs and queries beneath it.
 */
export function registerNativeGlesCoreHandlers(registry, runtimeState, eglContextState) {
	const pipeline = getNativeGlesPipelineState(runtimeState, eglContextState);
	registerNativeGlesPipelineHandlers(registry, pipeline);
	return Object.freeze({ pipeline });
}
