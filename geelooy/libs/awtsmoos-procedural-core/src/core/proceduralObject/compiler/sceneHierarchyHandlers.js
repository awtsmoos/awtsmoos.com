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
	requireObject
} from "./contextHelpers.js";

function replaceObject(context, object) {
	context.objects.set(object.id, createObjectArtifact(object));
}

/**
 * Registers parent-child hierarchy operations.
 *
 * @param {ProceduralOperationRegistry} registry Trusted registry.
 * @returns {ProceduralOperationRegistry} Same registry.
 */
export function registerSceneHierarchyHandlers(registry) {
	registry.register("parent_object", {
		handler: (context, command) => parentObject(context, command)
	});
	return registry;
}

function parentObject(context, command) {
	const child = requireObject(context, command.args.child);
	const parent = requireObject(context, command.args.parent);
	replaceObject(context, {
		...child,
		parentId: parent.id
	});
	replaceObject(context, {
		...parent,
		children: Array.from(new Set([
			...parent.children,
			child.id
		]))
	});
	return context.objects.get(child.id);
}
