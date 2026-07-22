// B"H
// Boruch Hashem
// Blessed is He
/** Built-in semantic catalogs seed Blender node APIs before any harvested manifest. */

import { createBlenderSchemaManifest } from "../createBlenderSchemaManifest.js";
import { BLENDER_GEOMETRY_ADVANCED_NODES } from "./geometryAdvancedCatalog.js";
import { BLENDER_GEOMETRY_CORE_NODES } from "./geometryCoreCatalog.js";
import { BLENDER_SHADER_SURFACE_NODES } from "./shaderSurfaceCatalog.js";
import { BLENDER_SHADER_TEXTURE_NODES } from "./shaderTextureCatalog.js";

/** Creates the renderer-neutral built-in Blender 4.5 semantic manifest. */
export function createBlenderBuiltinSchemaManifest(options = {}) {
	return createBlenderSchemaManifest({
		blenderVersion: options.blenderVersion ?? "4.5.0",
		buildHash: "awtsmoos-built-in-semantic-catalog",
		buildBranch: "renderer-neutral",
		buildPlatform: "any",
		exporterVersion: "1.0.0",
		treeTypes: [
			{
				nativeType: "GeometryNodeTree",
				name: "Geometry Nodes",
				category: "geometry",
				nodes: [...BLENDER_GEOMETRY_CORE_NODES, ...BLENDER_GEOMETRY_ADVANCED_NODES]
			},
			{
				nativeType: "ShaderNodeTree",
				name: "Shader Nodes",
				category: "material",
				nodes: [...BLENDER_SHADER_SURFACE_NODES, ...BLENDER_SHADER_TEXTURE_NODES]
			}
		],
		zones: [
			{ id: "simulation", inputNativeType: "GeometryNodeSimulationInput", outputNativeType: "GeometryNodeSimulationOutput" },
			{ id: "repeat", inputNativeType: "GeometryNodeRepeatInput", outputNativeType: "GeometryNodeRepeatOutput" },
			{ id: "foreach", inputNativeType: "GeometryNodeForeachGeometryElementInput", outputNativeType: "GeometryNodeForeachGeometryElementOutput" }
		],
		metadata: {
			source: "independent-semantic-implementation",
			opaqueFallback: true,
			uiAndOperatorCoverage: false
		}
	});
}
