// B"H

import { registerTopologySelectionHandlers } from "./topologySelectionHandlers.js";
import { registerTopologyTransitionHandlers } from "./topologyTransitionHandlers.js";

/** Registers every compiler-native persistent topology operation. */
export function registerTopologyIdentityHandlers(registry) {
	registerTopologyTransitionHandlers(registry);
	registerTopologySelectionHandlers(registry);
	return registry;
}
