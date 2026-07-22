// B"H
// Boruch Hashem
// Blessed is He
/** Material inputs expose shading context, coordinates, normals, and attributes. */

import { input, node, output } from "./nodeDefinitionHelpers.js";

export const MATERIAL_INPUT_NODES = Object.freeze([
	node("material.input.value", "Value", [input("value", "float", 0)], [output("value", "float")], { category: "input" }),
	node("material.input.rgb", "RGB", [input("color", "color", [0.5, 0.5, 0.5, 1])], [output("color", "color")], { category: "input" }),
	node("material.input.texture-coordinate", "Texture Coordinate", [input("object", "object")], [output("generated", "vector"), output("normal", "normal"), output("uv", "vector"), output("object", "vector"), output("camera", "vector"), output("window", "vector"), output("reflection", "vector")], { category: "coordinate" }),
	node("material.input.geometry", "Geometry", [], [output("position", "point"), output("normal", "normal"), output("tangent", "direction"), output("true-normal", "normal"), output("incoming", "direction"), output("parametric", "vector"), output("backfacing", "boolean"), output("pointiness", "float"), output("random-per-island", "float")], { category: "context" }),
	node("material.input.object-info", "Object Info", [input("object", "object")], [output("location", "translation"), output("color", "color"), output("alpha", "float"), output("object-index", "integer"), output("material-index", "integer"), output("random", "float")], { category: "context" }),
	node("material.input.particle-info", "Particle Info", [], [output("index", "integer"), output("random", "float"), output("age", "time"), output("lifetime", "time"), output("location", "point"), output("size", "float"), output("velocity", "velocity"), output("angular-velocity", "velocity")], { category: "context" }),
	node("material.input.hair-info", "Hair Info", [], [output("is-strand", "boolean"), output("intercept", "factor"), output("length", "distance"), output("thickness", "distance"), output("tangent-normal", "normal"), output("random", "float")], { category: "context" }),
	node("material.input.layer-weight", "Layer Weight", [input("blend", "factor", 0.5), input("normal", "normal")], [output("fresnel", "factor"), output("facing", "factor")], { category: "fresnel" }),
	node("material.input.fresnel", "Fresnel", [input("ior", "float", 1.45), input("normal", "normal")], [output("factor", "factor")], { category: "fresnel" }),
	node("material.input.camera-data", "Camera Data", [], [output("view-vector", "direction"), output("view-z-depth", "distance"), output("view-distance", "distance")], { category: "context" }),
	node("material.input.light-path", "Light Path", [], [output("is-camera-ray", "boolean"), output("is-shadow-ray", "boolean"), output("is-diffuse-ray", "boolean"), output("is-glossy-ray", "boolean"), output("is-singular-ray", "boolean"), output("is-reflection-ray", "boolean"), output("is-transmission-ray", "boolean"), output("ray-length", "distance"), output("ray-depth", "integer")], { category: "context" }),
	node("material.input.attribute", "Attribute", [input("name", "string")], [output("color", "color"), output("vector", "vector"), output("factor", "float"), output("alpha", "float")], { category: "attribute" }),
	node("material.input.vertex-color", "Vertex Color", [input("layer-name", "string")], [output("color", "color"), output("alpha", "float")], { category: "attribute" }),
	node("material.input.uv-map", "UV Map", [input("uv-map", "string")], [output("uv", "vector")], { category: "attribute" }),
	node("material.input.tangent", "Tangent", [input("axis", "menu"), input("uv-map", "string")], [output("tangent", "direction")], { category: "normal" }),
	node("material.input.normal-map", "Normal Map", [input("strength", "factor", 1), input("color", "color", [0.5, 0.5, 1, 1]), input("uv-map", "string")], [output("normal", "normal")], { category: "normal" }),
	node("material.input.bump", "Bump", [input("strength", "factor", 1), input("distance", "distance", 0.1), input("height", "float"), input("normal", "normal"), input("invert", "boolean", false)], [output("normal", "normal")], { category: "normal" }),
	node("material.input.ambient-occlusion", "Ambient Occlusion", [input("color", "color", [1, 1, 1, 1]), input("distance", "distance", 1), input("normal", "normal")], [output("color", "color"), output("ao", "factor")], { category: "context", requiredCapabilities: ["ambient-occlusion"] })
]);
