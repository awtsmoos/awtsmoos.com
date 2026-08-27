// B"H

import {
	assignFaceMaterials,
	compactGeometryVertices,
	repairTriangleGeometry,
	weldGeometryVertices
} from "../geometry/topology/index.js";
import { requireGeometry, storeGeometry } from "./contextHelpers.js";

function sourceGeometry(context, command) {
	return requireGeometry(context, command.args.source);
}

function storeResult(context, command, geometry) {
	return storeGeometry(context, command, geometry);
}

/** Registers topology-preserving and topology-repair geometry operations. */
export function registerGeometryTopologyHandlers(registry) {
	registry.register("compact_geometry", {
		handler: (context, command) => storeResult(
			context, command, compactGeometryVertices(sourceGeometry(context, command), { id: command.target })
		)
	});
	registry.register("weld_geometry", {
		handler: (context, command) => storeResult(context, command, weldGeometryVertices(
			sourceGeometry(context, command),
			{ id: command.target, tolerance: command.args.tolerance, policy: command.args.policy }
		))
	});
	registry.register("repair_geometry", {
		handler: (context, command) => storeResult(context, command, repairTriangleGeometry(
			sourceGeometry(context, command),
			{
				id: command.target,
				epsilon: command.args.epsilon,
				removeDegenerate: command.args.removeDegenerate,
				removeDuplicate: command.args.removeDuplicate,
				compact: command.args.compact,
				recomputeNormals: command.args.recomputeNormals
			}
		))
	});
	registry.register("assign_face_materials", {
		handler: (context, command) => storeResult(context, command, assignFaceMaterials(
			sourceGeometry(context, command),
			command.args.materialIndices,
			{ id: command.target, materialSlots: command.args.materialSlots }
		))
	});
	return registry;
}
