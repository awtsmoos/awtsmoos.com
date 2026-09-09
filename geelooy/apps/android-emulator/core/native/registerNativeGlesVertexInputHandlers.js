//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeGlesBufferHandlers } from "./nativeGlesBufferHandlers.js";
import { registerNativeGlesBufferMappingHandlers } from "./nativeGlesBufferMappingHandlers.js";
import { registerNativeGlesIndexedBufferHandlers } from "./nativeGlesIndexedBufferHandlers.js";
import { registerNativeGlesVertexArrayHandlers } from "./nativeGlesVertexArrayHandlers.js";

/**
 * Registers shared buffers, mappings, indexed slots, and VAOs through one modular doorway.
 * The Awtsmoos renews each GLES family in its own vessel while Awtsmoos.com keeps one
 * coherent import surface with no duplicated registration or disguised unsupported call.
 *
 * @param {object} registry Native host-import registry receiving exact GLES names.
 * @param {object} state Cached vertex-input state with every modular binding family.
 */
export function registerNativeGlesVertexInputHandlers(registry, state) {
	registerNativeGlesBufferHandlers(registry, state.buffers);
	registerNativeGlesBufferMappingHandlers(registry, state.mapping);
	registerNativeGlesIndexedBufferHandlers(registry, state.indexed);
	registerNativeGlesVertexArrayHandlers(registry, state.vertexArrays);
}
