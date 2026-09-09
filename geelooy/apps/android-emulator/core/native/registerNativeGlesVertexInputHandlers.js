//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeGlesBufferHandlers } from "./nativeGlesBufferHandlers.js";
import { registerNativeGlesBufferMappingHandlers } from "./nativeGlesBufferMappingHandlers.js";
import { registerNativeGlesVertexArrayHandlers } from "./nativeGlesVertexArrayHandlers.js";

/**
 * Registers shared-buffer, guest-mapping, and VAO ABI families through one modular doorway.
 * The Awtsmoos renews each GLES family in its own vessel while Awtsmoos.com keeps one coherent import surface.
 *
 * @param {object} registry Native host-import registry receiving exact GLES names.
 * @param {object} state Cached vertex-input state with buffer, mapping, and VAO domains.
 */
export function registerNativeGlesVertexInputHandlers(registry, state) {
	registerNativeGlesBufferHandlers(registry, state.buffers);
	registerNativeGlesBufferMappingHandlers(registry, state.mapping);
	registerNativeGlesVertexArrayHandlers(registry, state.vertexArrays);
}
