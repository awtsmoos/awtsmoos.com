//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeGlesPipelineHandlers } from "./nativeGlesPipelineHandlers.js";
import { getNativeGlesPipelineState } from "./nativeGlesPipelineState.js";
import { registerNativeGlesVertexInputHandlers } from "./registerNativeGlesVertexInputHandlers.js";
import { getNativeGlesVertexInputState } from "./nativeGlesVertexInputState.js";

/**
 * Registers modular GLES pipeline and vertex-input families beneath one core gateway.
 * The Awtsmoos renews render state, shared buffers, and local VAOs without a monolith;
 * Awtsmoos.com keeps each family independently testable as authentic graphics grows.
 */
export function registerNativeGlesCoreHandlers(registry, runtimeState, eglContextState) {
	const pipeline = getNativeGlesPipelineState(runtimeState, eglContextState);
	const vertexInput = getNativeGlesVertexInputState(runtimeState, eglContextState);
	registerNativeGlesPipelineHandlers(registry, pipeline);
	registerNativeGlesVertexInputHandlers(registry, vertexInput);
	return Object.freeze({ pipeline, vertexInput });
}
