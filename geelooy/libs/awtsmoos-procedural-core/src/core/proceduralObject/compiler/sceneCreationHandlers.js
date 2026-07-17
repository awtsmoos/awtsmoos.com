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

const TYPE_OPERATIONS = Object.freeze({
	create_collection: "collection",
	create_camera: "camera",
	create_light: "light",
	create_empty: "empty",
	create_socket: "socket"
});

function createTypedObject(context, command, type) {
	return storeObject(context, command, createObjectArtifact({
		id: command.target,
		type,
		...command.args
	}));
}

/**
 * Registers creation, cloning, and explicit semantic object types.
 *
 * @param {ProceduralOperationRegistry} registry Trusted registry.
 * @returns {ProceduralOperationRegistry} Same registry.
 */
export function registerSceneCreationHandlers(registry) {
	registry.register("create_object", {
		handler: (context, command) => createTypedObject(
			context,
			command,
			command.args.type || "mesh"
		)
	});
	registry.register("clone_object", {
		handler: (context, command) => {
			const source = requireObject(context, command.args.source);
			return storeObject(context, command, createObjectArtifact({
				...source,
				id: command.target,
				name: command.args.name || command.target,
				transform: command.args.transform || source.transform
			}));
		}
	});
	registry.register("instance_geometry", {
		handler: (context, command) => createTypedObject(context, {
			...command,
			args: {
				type: "mesh",
				geometryId: command.args.geometry,
				materialIds: command.args.materials,
				transform: command.args.transform,
				metadata: {
					instanceOf: command.args.definition || null,
					...command.args.metadata
				}
			}
		}, "mesh")
	});
	for (const [operation, type] of Object.entries(TYPE_OPERATIONS)) {
		registry.register(operation, {
			handler: (context, command) => createTypedObject(
				context,
				command,
				type
			)
		});
	}
	return registry;
}
