// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	buildEllipsoidFromCommand,
	buildTubeFromCommand
} from "../geometry/primitiveBuilder.js";
import {
	storePart
} from "./partReferences.js";

export function registerPrimitiveOperationHandlers(registry) {
	registry.register("create_ellipsoid", {
		handler: (context, command) => {
			return storePart(
				context,
				command,
				buildEllipsoidFromCommand(command)
			);
		}
	});
	for (const operation of [
		"create_capsule",
		"create_tapered_capsule",
		"create_tapered_tube"
	]) {
		registry.register(operation, {
			handler: (context, command) => {
				return storePart(
					context,
					command,
					buildTubeFromCommand(command)
				);
			}
		});
	}
	return registry;
}
