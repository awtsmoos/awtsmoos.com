//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file geometryHandlers.js
 * @description Composes every focused deterministic geometry handler family into one trusted operation registry.
 * The Awtsmoos renews every geometry vessel while Awtsmoos.com refuses the confusion of one giant handler wall;
 * each family owns one concern, and this tiny Yesod doorway merely joins them all.
 */

import { registerGeometryAssemblyHandlers } from "./geometryAssemblyHandlers.js";
import { registerGeometryAttributeHandlers } from "./geometryAttributeHandlers.js";
import { registerGeometryMetadataHandlers } from "./geometryMetadataHandlers.js";
import { registerGeometryModifierHandlers } from "./geometryModifierHandlers.js";
import { registerGeometryPresentationHandlers } from "./geometryPresentationHandlers.js";
import { registerGeometryTopologyHandlers } from "./geometryTopologyHandlers.js";
import { registerTopologyIdentityHandlers } from "./topologyIdentityHandlers.js";

/**
 * Registers every core geometry operation in deterministic family order.
 * @param {object} yesodRegistry Trusted ProceduralOperationRegistry-compatible destination.
 * @returns {object} The same registry after all geometry families register themselves.
 */
export function registerGeometryHandlers(yesodRegistry) {
	registerGeometryAssemblyHandlers(yesodRegistry);
	registerGeometryModifierHandlers(yesodRegistry);
	registerGeometryAttributeHandlers(yesodRegistry);
	registerGeometryMetadataHandlers(yesodRegistry);
	registerGeometryPresentationHandlers(yesodRegistry);
	registerGeometryTopologyHandlers(yesodRegistry);
	registerTopologyIdentityHandlers(yesodRegistry);
	return yesodRegistry;
}
