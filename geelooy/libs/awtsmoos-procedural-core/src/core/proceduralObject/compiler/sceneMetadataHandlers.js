// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	createObjectArtifact
} from "../artifact/createObjectArtifact.js";
import {
	requireObject,
	storeObject
} from "./contextHelpers.js";

function updateObject(context, command, changes) {
	const source = requireObject(
		context,
		command.args.object || command.args.source
	);
	return storeObject(context, command, createObjectArtifact({
		...source,
		...changes,
		id: command.target
	}));
}

/**
 * Registers materials, constraints, drivers, custom properties, and LOD data.
 *
 * @param {ProceduralOperationRegistry} registry Trusted registry.
 * @returns {ProceduralOperationRegistry} Same registry.
 */
export function registerSceneMetadataHandlers(registry) {
	registry.register("create_material", {
		handler: (context, command) => {
			context.materials.set(command.target, Object.freeze({
				id: command.target,
				...command.args
			}));
		}
	});
	registry.register("assign_materials", {
		handler: (context, command) => updateObject(context, command, {
			materialIds: command.args.materials || []
		})
	});
	registry.register("add_constraint", {
		handler: (context, command) => {
			const source = requireObject(context, command.args.object);
			return updateObject(context, command, {
				constraints: [
					...source.constraints,
					Object.freeze({...command.args.constraint})
				]
			});
		}
	});
	registry.register("create_custom_property", {
		handler: (context, command) => {
			const source = requireObject(context, command.args.object);
			return updateObject(context, command, {
				metadata: {
					...source.metadata,
					properties: {
						...source.metadata.properties,
						[command.args.name]: command.args.value
					}
				}
			});
		}
	});
	registry.register("create_driver", {
		handler: (context, command) => {
			context.animations.set(command.target, Object.freeze({
				id: command.target,
				type: "driver",
				...command.args
			}));
		}
	});
	registry.register("create_lod_set", {
		handler: (context, command) => {
			context.metadata.lodSets = {
				...context.metadata.lodSets,
				[command.target]: Object.freeze({...command.args})
			};
		}
	});
	return registry;
}
