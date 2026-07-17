// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	mergeGeometries
} from "../geometry/mergeGeometries.js";
import {
	transformGeometry
} from "../geometry/transformGeometry.js";
import {
	requireGeometry,
	storeGeometry
} from "./contextHelpers.js";

function mirroredMatrix(axis, offset = 0) {
	const axisIndex = {
		X: 0,
		Y: 1,
		Z: 2
	}[String(axis || "X").toUpperCase()];
	if (axisIndex === undefined) {
		throw new Error(`B"H | Unknown mirror axis: ${axis}`);
	}
	const matrix = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];
	matrix[axisIndex * 4 + axisIndex] = -1;
	matrix[axisIndex * 4 + 3] = offset * 2;
	return matrix;
}

/**
 * Registers transforms, mirrors, and merges.
 *
 * @param {ProceduralOperationRegistry} registry Trusted registry.
 * @returns {ProceduralOperationRegistry} Same registry.
 */
export function registerGeometryAssemblyHandlers(registry) {
	registry.register("transform_geometry", {
		handler: (context, command) => storeGeometry(
			context,
			command,
			transformGeometry(
				requireGeometry(context, command.args.source),
				command.args.transform || command.args,
				command.target
			)
		)
	});
	registry.register("mirror_geometry", {
		handler: (context, command) => storeGeometry(
			context,
			command,
			transformGeometry(
				requireGeometry(context, command.args.source),
				{matrix: mirroredMatrix(command.args.axis, command.args.offset)},
				command.target
			)
		)
	});
	registry.register("merge_geometries", {
		handler: (context, command) => storeGeometry(
			context,
			command,
			mergeGeometries(
				(command.args.sources || []).map(
					(id) => requireGeometry(context, id)
				),
				command.target
			)
		)
	});
	return registry;
}
