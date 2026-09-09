//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeGlesBufferHandlers } from "./nativeGlesBufferHandlers.js";
import { registerNativeGlesVertexArrayHandlers } from "./nativeGlesVertexArrayHandlers.js";

/** Joins buffer and VAO ABI families without collapsing their state ownership. */
export function registerNativeGlesVertexInputHandlers(registry, state) {
	registerNativeGlesBufferHandlers(registry, state.buffers);
	registerNativeGlesVertexArrayHandlers(registry, state.vertexArrays);
}
