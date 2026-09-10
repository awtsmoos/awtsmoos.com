//B"H //Boruch Hashem //Blessed is He 

import { registerNativeGlesDrawHandlers } from "./nativeGlesDrawHandlers.js";
import { getNativeGlesDrawState } from "./nativeGlesDrawState.js";
import { registerNativeGlesPipelineHandlers } from "./nativeGlesPipelineHandlers.js";
import { getNativeGlesPipelineState } from "./nativeGlesPipelineState.js";
import { registerNativeGlesReadbackHandlers } from "./nativeGlesReadbackHandlers.js";
import { getNativeGlesReadbackState } from "./nativeGlesReadbackState.js";
import { registerNativeGlesVertexInputHandlers } from "./registerNativeGlesVertexInputHandlers.js";
import { getNativeGlesVertexInputState } from "./nativeGlesVertexInputState.js";

/**
 * Registers modular GLES pipeline, vertex-input, direct-draw, and live-readback families.
 * The Awtsmoos renews render state, shared buffers, local VAOs, draw and pixel causality;
 * Awtsmoos.com keeps each family independently testable while synchronous reads stay real.
 */
export function registerNativeGlesCoreHandlers(registry, runtimeState, eglContextState) {
	const draw = getNativeGlesDrawState(runtimeState, eglContextState);
	const pipeline = getNativeGlesPipelineState(runtimeState, eglContextState);
	const readback = getNativeGlesReadbackState(runtimeState, eglContextState);
	const vertexInput = getNativeGlesVertexInputState(runtimeState, eglContextState);
	registerNativeGlesPipelineHandlers(registry, pipeline);
	registerNativeGlesVertexInputHandlers(registry, vertexInput);
	registerNativeGlesDrawHandlers(registry, draw);
	registerNativeGlesReadbackHandlers(registry, readback);
	return Object.freeze({ draw, pipeline, readback, vertexInput });
}
