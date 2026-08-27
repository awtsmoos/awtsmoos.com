// B"H
// Boruch Hashem
// Blessed is He
/** Texture, color, vector, and converter nodes open material graph connections. */

import { catalogNode as node, catalogSocket as socket } from "./catalogSockets.js";
const color = id => socket(id, "color");
const value = id => socket(id, "float");
const vector = id => socket(id, "vector");

export const BLENDER_SHADER_TEXTURE_NODES = Object.freeze([
	node("ShaderNodeTexImage", "texture", [vector("vector"), socket("image", "image")], [color("color"), value("alpha")]),
	node("ShaderNodeTexNoise", "texture", [vector("vector"), value("scale"), value("detail"), value("roughness"), value("lacunarity"), value("distortion")], [value("factor"), color("color")]),
	node("ShaderNodeTexVoronoi", "texture", [vector("vector"), value("scale"), value("detail"), value("roughness"), value("lacunarity"), value("randomness")], [value("distance"), color("color"), vector("position")]),
	node("ShaderNodeTexWave", "texture", [vector("vector"), value("scale"), value("distortion"), value("detail"), value("detail-scale")], [value("factor"), color("color")]),
	node("ShaderNodeTexGradient", "texture", [vector("vector")], [value("factor"), color("color")]),
	node("ShaderNodeTexChecker", "texture", [vector("vector"), color("color-1"), color("color-2"), value("scale")], [color("color"), value("factor")]),
	node("ShaderNodeTexCoord", "input", [], [vector("generated"), vector("normal"), vector("uv"), vector("object"), vector("camera"), vector("window"), vector("reflection")]),
	node("ShaderNodeMapping", "vector", [vector("vector"), vector("location"), vector("rotation"), vector("scale")], [vector("vector")]),
	node("ShaderNodeObjectInfo", "input", [socket("object", "object")], [vector("location"), color("color"), value("alpha"), value("object-index"), value("material-index"), value("random")]),
	node("ShaderNodeNewGeometry", "input", [], [vector("position"), vector("normal"), vector("tangent"), value("backfacing"), value("pointiness"), value("random-per-island")]),
	node("ShaderNodeMath", "converter", [value("value-1"), value("value-2"), value("value-3")], [value("value")]),
	node("ShaderNodeVectorMath", "converter", [vector("vector-1"), vector("vector-2"), vector("vector-3"), value("scale")], [vector("vector"), value("value")]),
	node("ShaderNodeMix", "color", [value("factor"), vector("factor-vector"), color("a"), color("b")], [color("result")]),
	node("ShaderNodeValToRGB", "color", [value("factor")], [color("color"), value("alpha")]),
	node("ShaderNodeMapRange", "converter", [value("value"), value("from-min"), value("from-max"), value("to-min"), value("to-max"), value("steps")], [value("result")]),
	node("ShaderNodeSeparateColor", "converter", [color("color")], [value("red"), value("green"), value("blue"), value("alpha")]),
	node("ShaderNodeCombineColor", "converter", [value("red"), value("green"), value("blue"), value("alpha")], [color("color")])
]);
