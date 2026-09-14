//B"H
//Boruch Hashem
//Blessed be He

import { registerNativeGles3BufferObjectQueryHandlers } from "./nativeGles3BufferObjectQueryHandlers.js";
import { registerNativeGles3IndexedQueryHandlers } from "./nativeGles3IndexedQueryHandlers.js";

/** Registers all current GLES3 buffer query families over one shared vertex-input state. */
export function registerNativeGles3BufferQueryHandlers(registry, vertexInput) {
	registerNativeGles3BufferObjectQueryHandlers(registry, vertexInput);
	registerNativeGles3IndexedQueryHandlers(registry, vertexInput);
}
