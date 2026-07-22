// B"H
// Boruch Hashem
// Blessed is He
/** Surface shader nodes expose closure composition, normals, and displacement. */

import { catalogNode as node, catalogSocket as socket } from "./catalogSockets.js";
const shader = id => socket(id, "shader");
const color = id => socket(id, "color");
const value = id => socket(id, "float");
const vector = id => socket(id, "vector");

export const BLENDER_SHADER_SURFACE_NODES = Object.freeze([
	node("ShaderNodeOutputMaterial", "output", [socket("surface", "shader.surface"), socket("volume", "shader.volume"), socket("displacement", "shader.displacement")], []),
	node("ShaderNodeBsdfPrincipled", "shader", [color("base-color"), value("metallic"), value("roughness"), value("ior"), value("alpha"), vector("normal"), value("weight")], [socket("bsdf", "shader.surface")]),
	node("ShaderNodeBsdfDiffuse", "shader", [color("color"), value("roughness"), vector("normal"), value("weight")], [socket("bsdf", "shader.surface")]),
	node("ShaderNodeBsdfGlass", "shader", [color("color"), value("roughness"), value("ior"), vector("normal"), value("weight")], [socket("bsdf", "shader.surface")]),
	node("ShaderNodeBsdfTransparent", "shader", [color("color"), value("weight")], [socket("bsdf", "shader.surface")]),
	node("ShaderNodeEmission", "shader", [color("color"), value("strength"), value("weight")], [socket("emission", "shader.emission")]),
	node("ShaderNodeAddShader", "shader", [shader("shader-1"), shader("shader-2")], [shader("shader")]),
	node("ShaderNodeMixShader", "shader", [value("factor"), shader("shader-1"), shader("shader-2")], [shader("shader")]),
	node("ShaderNodeVolumePrincipled", "volume", [color("color"), value("density"), value("anisotropy"), color("absorption-color"), value("temperature")], [socket("volume", "shader.volume")]),
	node("ShaderNodeVolumeAbsorption", "volume", [color("color"), value("density")], [socket("volume", "shader.volume")]),
	node("ShaderNodeVolumeScatter", "volume", [color("color"), value("density"), value("anisotropy")], [socket("volume", "shader.volume")]),
	node("ShaderNodeDisplacement", "vector", [value("height"), value("midlevel"), value("scale"), vector("normal")], [socket("displacement", "shader.displacement")]),
	node("ShaderNodeBump", "vector", [value("strength"), value("distance"), value("height"), vector("normal")], [vector("normal")]),
	node("ShaderNodeNormalMap", "vector", [value("strength"), color("color")], [vector("normal")]),
	node("ShaderNodeFresnel", "input", [value("ior"), vector("normal")], [value("factor")]),
	node("ShaderNodeLayerWeight", "input", [value("blend"), vector("normal")], [value("fresnel"), value("facing")])
]);
