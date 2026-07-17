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

function copyWith(source, command, changes) {
	return createGeometryArtifact({
		...source,
		...changes,
		id: command.target
	});
}

/**
 * Registers groups and morph-target metadata operations.
 *
 * @param {ProceduralOperationRegistry} registry Trusted registry.
 * @returns {ProceduralOperationRegistry} Same registry.
 */
export function registerGeometryMetadataHandlers(registry) {
	registry.register("set_groups", {
		handler: (context, command) => storeGeometry(
			context,
			command,
			copyWith(requireGeometry(context, command.args.source), command, {
				groups: command.args.groups || []
			})
		)
	});
	registry.register("set_morph_target", {
		handler: (context, command) => {
			const source = requireGeometry(context, command.args.source);
			return storeGeometry(context, command, copyWith(source, command, {
				morphTargets: {
					...source.morphTargets,
					[command.args.name]: command.args.attributes
				},
				morphTargetsRelative: command.args.relative === true
			}));
		}
	});
	return registry;
}
