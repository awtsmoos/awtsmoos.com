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
	buildBoxGeometry
} from "../geometry/buildBoxGeometry.js";
import {
	buildCylinderGeometry
} from "../geometry/buildCylinderGeometry.js";
import {
	buildExtrudedProfile
} from "../geometry/buildExtrudedProfile.js";
import {
	buildPlaneGeometry
} from "../geometry/buildPlaneGeometry.js";
import {
	buildRevolvedProfile
} from "../geometry/buildRevolvedProfile.js";
import {
	buildUvSphereGeometry
} from "../geometry/buildUvSphereGeometry.js";
import {
	storeGeometry
} from "./contextHelpers.js";

const BUILDERS = Object.freeze({
	create_box: buildBoxGeometry,
	create_plane: buildPlaneGeometry,
	create_uv_sphere: buildUvSphereGeometry,
	create_cylinder: buildCylinderGeometry,
	extrude_profile: buildExtrudedProfile,
	revolve_profile: buildRevolvedProfile
});

/**
 * Registers generic primitive and raw indexed geometry operations.
 *
 * @param {ProceduralOperationRegistry} registry Trusted registry.
 * @returns {ProceduralOperationRegistry} Same registry.
 */
export function registerPrimitiveHandlers(registry) {
	registry.register("create_indexed_geometry", {
		handler: (context, command) => storeGeometry(
			context,
			command,
			createGeometryArtifact({
				id: command.target,
				...(command.args?.geometry || command.args)
			})
		)
	});
	for (const [operation, builder] of Object.entries(BUILDERS)) {
		registry.register(operation, {
			handler: (context, command) => storeGeometry(
				context,
				command,
				builder(command.args, command.target)
			)
		});
	}
	return registry;
}
