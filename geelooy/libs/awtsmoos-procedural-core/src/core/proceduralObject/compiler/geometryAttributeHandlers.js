// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	removeGeometryAttribute,
	setGeometryAttribute,
	setGeometryIndices
} from "../geometry/attributeOperations.js";
import {
	requireGeometry,
	storeGeometry
} from "./contextHelpers.js";

/**
 * Registers arbitrary attribute and index mutations.
 *
 * @param {ProceduralOperationRegistry} registry Trusted registry.
 * @returns {ProceduralOperationRegistry} Same registry.
 */
export function registerGeometryAttributeHandlers(registry) {
	registry.register("set_attribute", {
		handler: (context, command) => storeGeometry(
			context,
			command,
			setGeometryAttribute(
				requireGeometry(context, command.args.source),
				command.args.name,
				command.args.attribute,
				command.target
			)
		)
	});
	registry.register("remove_attribute", {
		handler: (context, command) => storeGeometry(
			context,
			command,
			removeGeometryAttribute(
				requireGeometry(context, command.args.source),
				command.args.name,
				command.target
			)
		)
	});
	registry.register("set_indices", {
		handler: (context, command) => storeGeometry(
			context,
			command,
			setGeometryIndices(
				requireGeometry(context, command.args.source),
				command.args.indices,
				command.target
			)
		)
	});
	return registry;
}
