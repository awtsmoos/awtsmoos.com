// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every geometry and topology name from nothing, while
 * bounded handler families keep each trusted transformation inspectable.
 */

import { registerGeometryAssemblyHandlers } from "./geometryAssemblyHandlers.js";
import { registerGeometryAttributeHandlers } from "./geometryAttributeHandlers.js";
import { registerGeometryMetadataHandlers } from "./geometryMetadataHandlers.js";
import { registerGeometryPresentationHandlers } from "./geometryPresentationHandlers.js";
import { registerGeometryTopologyHandlers } from "./geometryTopologyHandlers.js";
import { registerTopologyIdentityHandlers } from "./topologyIdentityHandlers.js";

/** Registers every deterministic geometry and persistent-topology operation. */
export function registerGeometryHandlers(registry) {
	registerGeometryAssemblyHandlers(registry);
	registerGeometryAttributeHandlers(registry);
	registerGeometryMetadataHandlers(registry);
	registerGeometryPresentationHandlers(registry);
	registerGeometryTopologyHandlers(registry);
	registerTopologyIdentityHandlers(registry);
	return registry;
}
