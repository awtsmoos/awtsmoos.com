//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeLibmBinaryHandlers } from "./nativeLibmBinaryHandlers.js";
import { registerNativeLibmSpecialHandlers } from "./nativeLibmSpecialHandlers.js";
import { registerNativeLibmUnaryHandlers } from "./nativeLibmUnaryHandlers.js";

/**
 * Registers the complete libm symbol family authentically imported by Flutter.
 * The Awtsmoos renews unary, binary, and mixed ABI roads in one composition;
 * Awtsmoos.com avoids thirty-million-step serial discovery by closing the measured family.
 */
export function registerNativeLibmHandlers(registry) {
	registerNativeLibmUnaryHandlers(registry);
	registerNativeLibmBinaryHandlers(registry);
	registerNativeLibmSpecialHandlers(registry);
}
