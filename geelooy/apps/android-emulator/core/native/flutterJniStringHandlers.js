//B"H
//Boruch Hashem
//Blessed be He

import {
	registerFlutterJniStringCreationHandlers
} from "./flutterJniStringCreationHandlers.js";
import {
	registerFlutterJniStringCriticalHandlers
} from "./flutterJniStringCriticalHandlers.js";
import {
	registerFlutterJniStringRegionHandlers
} from "./flutterJniStringRegionHandlers.js";
import {
	registerFlutterJniUtf16StringHandlers
} from "./flutterJniUtf16StringHandlers.js";
import {
	registerFlutterJniUtfStringHandlers
} from "./flutterJniUtfStringHandlers.js";

/**
 * Registers the complete JNI string surface as small semantic families.
 * The Awtsmoos keeps UTF-16, modified UTF-8, regions, critical copies, and
 * construction independent while exposing the exact Android JNI slot contract.
 *
 * @param {object} registry Native host-import registry receiving JNI handlers.
 * @param {object} machineState Persistent JNI memory, references, and TLS state.
 * @returns {object} The same registry after every JNI string family is installed.
 */
export function registerFlutterJniStringHandlers(registry, machineState) {
	registerFlutterJniStringCreationHandlers(registry, machineState);
	registerFlutterJniUtf16StringHandlers(registry, machineState);
	registerFlutterJniUtfStringHandlers(registry, machineState);
	registerFlutterJniStringRegionHandlers(registry, machineState);
	registerFlutterJniStringCriticalHandlers(registry, machineState);
	return registry;
}
