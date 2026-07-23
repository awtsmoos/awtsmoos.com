// B"H
// Boruch Hashem
// Blessed is He
/** Native reference executors provide trustworthy CPU semantics and Blender aliases. */

import { NativeReferenceExecutorRegistry } from "./NativeReferenceExecutorRegistry.js";
import {
	executeJoinGeometry,
	executeSetPosition,
	executeSubdivideMesh
} from "./advancedGeometryExecutors.js";
import {
	executeGlass,
	executePrincipledVolume,
	executeTransparent,
	executeVolumeAbsorption
} from "./advancedShaderExecutors.js";
import { executeCube, executeGrid, executeTransformGeometry } from "./geometryExecutors.js";
import { executeBooleanMath, executeClamp, executeMapRange, executeScalarMath } from "./mathExecutors.js";
import { executeEmission, executeMaterialOutput, executeMixSurface, executePrincipledSurface } from "./shaderExecutors.js";
import { executeNoiseTexture } from "./textureExecutors.js";
import { executeCombineColor, executeMix, executeSeparateColor, executeVectorMath } from "./vectorColorExecutors.js";

const EXECUTORS = Object.freeze({
	"function.math": executeScalarMath,
	"material.converter.math": executeScalarMath,
	"function.vector-math": executeVectorMath,
	"material.converter.vector-math": executeVectorMath,
	"function.boolean-math": executeBooleanMath,
	"function.map-range": executeMapRange,
	"material.converter.map-range": executeMapRange,
	"function.clamp": executeClamp,
	"material.converter.clamp": executeClamp,
	"material.converter.mix": executeMix,
	"material.converter.separate-color": executeSeparateColor,
	"material.converter.combine-color": executeCombineColor,
	"material.texture.noise": executeNoiseTexture,
	"material.shader.principled": executePrincipledSurface,
	"material.shader.emission": executeEmission,
	"material.shader.mix-surface": executeMixSurface,
	"material.shader.transparent": executeTransparent,
	"material.shader.glass": executeGlass,
	"material.shader.volume-principled": executePrincipledVolume,
	"material.shader.volume-absorption": executeVolumeAbsorption,
	"material.output.material": executeMaterialOutput,
	"geometry.mesh.cube": executeCube,
	"geometry.mesh.grid": executeGrid,
	"geometry.mesh.transform": executeTransformGeometry,
	"geometry.mesh.set-position": executeSetPosition,
	"geometry.mesh.subdivide": executeSubdivideMesh,
	"geometry.instance.join": executeJoinGeometry
});

const BLENDER_ALIASES = Object.freeze({
	ShaderNodeMath: "material.converter.math",
	ShaderNodeVectorMath: "material.converter.vector-math",
	ShaderNodeMapRange: "material.converter.map-range",
	ShaderNodeClamp: "material.converter.clamp",
	ShaderNodeMix: "material.converter.mix",
	ShaderNodeSeparateColor: "material.converter.separate-color",
	ShaderNodeCombineColor: "material.converter.combine-color",
	ShaderNodeTexNoise: "material.texture.noise",
	ShaderNodeBsdfPrincipled: "material.shader.principled",
	ShaderNodeEmission: "material.shader.emission",
	ShaderNodeMixShader: "material.shader.mix-surface",
	ShaderNodeBsdfTransparent: "material.shader.transparent",
	ShaderNodeBsdfGlass: "material.shader.glass",
	ShaderNodeVolumePrincipled: "material.shader.volume-principled",
	ShaderNodeVolumeAbsorption: "material.shader.volume-absorption",
	ShaderNodeOutputMaterial: "material.output.material",
	GeometryNodeMeshCube: "geometry.mesh.cube",
	GeometryNodeMeshGrid: "geometry.mesh.grid",
	GeometryNodeTransform: "geometry.mesh.transform",
	GeometryNodeSetPosition: "geometry.mesh.set-position",
	GeometryNodeSubdivideMesh: "geometry.mesh.subdivide",
	GeometryNodeJoinGeometry: "geometry.instance.join"
});

/** Creates a CPU reference registry and optional manifest aliases. */
export function createNativeReferenceExecutorRegistry(options = {}) {
	const registry = new NativeReferenceExecutorRegistry();
	for (const [type, executor] of Object.entries(EXECUTORS)) {
		registry.register(type, executor);
	}
	const definitions = options.surface?.blenderPack?.definitions ?? [];
	for (const definition of definitions) {
		const target = BLENDER_ALIASES[definition.metadata?.nativeType];
		if (target && registry.has(target)) {
			registry.alias(definition.type, target);
		}
	}
	return registry;
}
