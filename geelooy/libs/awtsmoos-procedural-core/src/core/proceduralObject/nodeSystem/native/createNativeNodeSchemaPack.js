// B"H
// Boruch Hashem
// Blessed is He
/** One native pack opens from-scratch geometry and material contracts. */

import { NodeDefinitionRegistry } from "../NodeDefinitionRegistry.js";
import { createNodeSchemaPack } from "../createNodeSchemaPack.js";
import { GEOMETRY_CURVE_NODES } from "./geometryCurveNodes.js";
import { GEOMETRY_FIELD_NODES } from "./geometryFieldNodes.js";
import { GEOMETRY_INPUT_NODES } from "./geometryInputNodes.js";
import { GEOMETRY_INSTANCE_NODES } from "./geometryInstanceNodes.js";
import { GEOMETRY_MESH_NODES } from "./geometryMeshNodes.js";
import { GEOMETRY_ZONE_NODES } from "./geometryZoneNodes.js";
import { MATERIAL_CONVERTER_NODES } from "./materialConverterNodes.js";
import { MATERIAL_INPUT_NODES } from "./materialInputNodes.js";
import { MATERIAL_OUTPUT_NODES } from "./materialOutputNodes.js";
import { MATERIAL_SHADER_NODES } from "./materialShaderNodes.js";
import { MATERIAL_TEXTURE_NODES } from "./materialTextureNodes.js";

export const NATIVE_NODE_DEFINITIONS = Object.freeze([
	...GEOMETRY_INPUT_NODES,
	...GEOMETRY_MESH_NODES,
	...GEOMETRY_CURVE_NODES,
	...GEOMETRY_INSTANCE_NODES,
	...GEOMETRY_FIELD_NODES,
	...GEOMETRY_ZONE_NODES,
	...MATERIAL_INPUT_NODES,
	...MATERIAL_TEXTURE_NODES,
	...MATERIAL_CONVERTER_NODES,
	...MATERIAL_SHADER_NODES,
	...MATERIAL_OUTPUT_NODES
]);

/** Creates the versioned native schema pack. */
export function createNativeNodeSchemaPack() {
	return createNodeSchemaPack({
		name: "awtsmoos-native-nodes",
		version: "1.0.0",
		family: "awtsmoos-native",
		definitions: NATIVE_NODE_DEFINITIONS,
		metadata: {
			geometryDefinitions: NATIVE_NODE_DEFINITIONS.filter(
				(definition) => definition.type.startsWith("geometry.")
			).length,
			materialDefinitions: NATIVE_NODE_DEFINITIONS.filter(
				(definition) => definition.type.startsWith("material.")
			).length,
			functionDefinitions: NATIVE_NODE_DEFINITIONS.filter(
				(definition) => definition.type.startsWith("function.")
			).length
		}
	});
}

/** Creates a ready-to-use definition registry. */
export function createNativeNodeDefinitionRegistry() {
	const registry = new NodeDefinitionRegistry();
	registry.registerPack(createNativeNodeSchemaPack());
	return registry;
}
