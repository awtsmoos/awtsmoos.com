// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	createGeometryArtifact
} from "../artifact/createGeometryArtifact.js";
import {
	requireGeometry,
	storeGeometry
} from "./contextHelpers.js";

function copyGeometry(context, command, changes = {}) {
	const source = requireGeometry(context, command.args.source);
	return storeGeometry(context, command, createGeometryArtifact({
		...source,
		...changes,
		id: command.target
	}));
}

/**
 * Registers renderer-neutral presentation and metadata geometry operations.
 *
 * @param {ProceduralOperationRegistry} registry Trusted registry.
 * @returns {ProceduralOperationRegistry} Same registry.
 */
export function registerGeometryPresentationHandlers(registry) {
	registry.register("clone_geometry", {
		handler: (context, command) => copyGeometry(context, command)
	});
	registry.register("set_draw_range", {
		handler: (context, command) => copyGeometry(context, command, {
			drawRange: command.args.draw_range || command.args.drawRange
		})
	});
	registry.register("set_material_slots", {
		handler: (context, command) => copyGeometry(context, command, {
			materialSlots: command.args.material_slots
				|| command.args.materialSlots
				|| []
		})
	});
	registry.register("set_geometry_metadata", {
		handler: (context, command) => {
			const source = requireGeometry(context, command.args.source);
			return copyGeometry(context, command, {
				metadata: {
					...source.metadata,
					...(command.args.metadata || {})
				}
			});
		}
	});
	return registry;
}
