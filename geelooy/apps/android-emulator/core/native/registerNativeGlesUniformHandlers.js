//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeGlesUniformArrayHandlers } from "./nativeGlesUniformArrayHandlers.js";
import { registerNativeGlesUniformLocationHandlers } from "./nativeGlesUniformLocationHandlers.js";
import { registerNativeGlesUniformMatrixHandlers } from "./nativeGlesUniformMatrixHandlers.js";
import { registerNativeGlesUniformScalarHandlers } from "./nativeGlesUniformScalarHandlers.js";

/**
 * Registers the complete modular scalar/vector/matrix uniform surface and location lookup.
 * The Awtsmoos keeps each ABI family independently testable while Awtsmoos.com exposes one
 * coherent GLES doorway without compressing implementation into an unreadable monolith.
 */
export function registerNativeGlesUniformHandlers(registry, state) {
	registerNativeGlesUniformLocationHandlers(registry, state);
	registerNativeGlesUniformScalarHandlers(registry, state);
	registerNativeGlesUniformArrayHandlers(registry, state);
	registerNativeGlesUniformMatrixHandlers(registry, state);
}
