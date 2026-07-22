// B"H
// Boruch Hashem
// Blessed is He
/** Standard material definitions describe portable shading intent, not a renderer. */

import {definition, input, output} from "./nodeDefinitionHelpers.js";

export const STANDARD_MATERIAL_NODE_DEFINITIONS = Object.freeze([
	definition("material.scalar", "material", [], [output("value", "float")]),
	definition("material.color", "material", [], [output("color", "color")]),
	definition("material.math", "material", [
		input("a", "float", 0), input("b", "float", 0)
	], [output("value", "float")]),
	definition("material.noise", "material", [
		input("vector", "vector", [0, 0, 0]), input("scale", "float", 5),
		input("detail", "float", 2), input("roughness", "factor", 0.5)
	], [output("factor", "factor"), output("color", "color")]),
	definition("material.mix-color", "material", [
		input("factor", "factor", 0.5), input("a", "color", [0, 0, 0, 1]),
		input("b", "color", [1, 1, 1, 1])
	], [output("color", "color")]),
	definition("material.color-ramp", "material", [input("factor", "factor", 0)], [
		output("color", "color")
	]),
	definition("material.principled", "material", [
		input("baseColor", "color", [0.8, 0.8, 0.8, 1]),
		input("roughness", "factor", 0.5), input("metallic", "factor", 0),
		input("ior", "float", 1.45), input("alpha", "factor", 1),
		input("emission", "color", [0, 0, 0, 1]), input("emissionStrength", "float", 0)
	], [output("surface", "shader.surface")]),
	definition("material.volume", "material", [
		input("color", "color", [1, 1, 1, 1]), input("density", "float", 0),
		input("anisotropy", "factor", 0)
	], [output("volume", "shader.volume")]),
	definition("material.output", "material", [
		input("surface", "shader.surface"), input("volume", "shader.volume")
	], [output("material", "material")])
]);
