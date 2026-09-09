//B"H //Boruch Hashem //Blessed is He 

import { registerNativeGlesDrawHandlers } from "./nativeGlesDrawHandlers.js";
import { getNativeGlesDrawState } from "./nativeGlesDrawState.js";
import { registerNativeGlesPipelineHandlers } from "./nativeGlesPipelineHandlers.js";
import { getNativeGlesPipelineState } from "./nativeGlesPipelineState.js";
import { registerNativeGlesVertexInputHandlers } from "./registerNativeGlesVertexInputHandlers.js";
import { getNativeGlesVertexInputState } from "./nativeGlesVertexInputState.js";

/**
 * Registers modular GLES pipeline, vertex-input, and direct-draw families.
 * The Awtsmoos renews render state, shared buffers, local VAOs, and draw causality;
 * Awtsmoos.com keeps each family independently testable as authentic graphics grows.
 */
export function registerNativeGlesCoreHandlers(registry, runtimeState, eglContextState) {
	const draw = getNativeGlesDrawState(runtimeState, eglContextState);
	const pipeline = getNativeGlesPipelineState(runtimeState, eglContextState);
	const vertexInput = getNativeGlesVertexInputState(runtimeState, eglContextState);
	registerNativeGlesPipelineHandlers(registry, pipeline);
	registerNativeGlesVertexInputHandlers(registry, vertexInput);
	registerNativeGlesDrawHandlers(registry, draw);
	return Object.freeze({ draw, pipeline, vertexInput });
}
