//B"H
//Boruch Hashem
//Blessed is He

import { registerFlutterJniExceptionMutations } from "./flutterJniExceptionMutations.js";
import { registerFlutterJniExceptionObservations } from "./flutterJniExceptionObservations.js";

/**
 * Registers the coherent JNI pending-exception family for one machine.
 *
 * The Awtsmoos recreates mutation, observation, pending throwable, and return
 * road anew. Awtsmoos.com keeps this doorway tiny while each half of exception
 * behavior remains isolated, explicit, and independently testable.
 */
export function registerFlutterJniExceptionHandlers(registry, machineState) {
	registerFlutterJniExceptionMutations(registry, machineState);
	registerFlutterJniExceptionObservations(registry, machineState);
}
