// B"H
// Boruch Hashem
// Blessed is He
/** Texture nodes expose deterministic procedural and sampled appearance fields. */

import { input, node, output } from "./nodeDefinitionHelpers.js";

export const MATERIAL_TEXTURE_NODES = Object.freeze([
	node("material.texture.noise", "Noise Texture", [input("vector", "vector"), input("scale", "float", 5), input("detail", "float", 2), input("roughness", "factor", 0.5), input("lacunarity", "float", 2), input("distortion", "float", 0)], [output("factor", "factor"), output("color", "color")], { category: "texture", requiredCapabilities: ["procedural-noise"] }),
	node("material.texture.voronoi", "Voronoi Texture", [input("vector", "vector"), input("scale", "float", 5), input("detail", "float", 0), input("roughness", "factor", 0.5), input("randomness", "factor", 1)], [output("distance", "float"), output("color", "color"), output("position", "point"), output("radius", "float")], { category: "texture", requiredCapabilities: ["voronoi"] }),
	node("material.texture.wave", "Wave Texture", [input("vector", "vector"), input("scale", "float", 5), input("distortion", "float", 0), input("detail", "float", 2), input("detail-scale", "float", 1), input("detail-roughness", "factor", 0.5), input("phase", "float", 0)], [output("color", "color"), output("factor", "factor")], { category: "texture" }),
	node("material.texture.fractal", "Fractal Texture", [input("vector", "vector"), input("scale", "float", 5), input("detail", "float", 4), input("dimension", "float", 1), input("lacunarity", "float", 2), input("offset", "float", 0), input("gain", "float", 1)], [output("factor", "factor"), output("color", "color")], { category: "texture", requiredCapabilities: ["fractal-noise"] }),
	node("material.texture.white-noise", "White Noise", [input("vector", "vector"), input("w", "float")], [output("value", "float"), output("color", "color")], { category: "texture" }),
	node("material.texture.magic", "Magic Texture", [input("vector", "vector"), input("scale", "float", 5), input("distortion", "float", 1)], [output("color", "color"), output("factor", "float")], { category: "texture" }),
	node("material.texture.brick", "Brick Texture", [input("vector", "vector"), input("color-one", "color"), input("color-two", "color"), input("mortar", "color"), input("scale", "float", 5), input("mortar-size", "float", 0.02), input("mortar-smooth", "float", 0), input("bias", "float", 0), input("brick-width", "float", 0.5), input("row-height", "float", 0.25)], [output("color", "color"), output("factor", "factor")], { category: "texture" }),
	node("material.texture.checker", "Checker Texture", [input("vector", "vector"), input("color-one", "color"), input("color-two", "color"), input("scale", "float", 5)], [output("color", "color"), output("factor", "factor")], { category: "texture" }),
	node("material.texture.gradient", "Gradient Texture", [input("vector", "vector")], [output("factor", "factor")], { category: "texture" }),
	node("material.texture.image", "Image Texture", [input("vector", "vector"), input("image", "image")], [output("color", "color"), output("alpha", "float")], { category: "texture", requiredCapabilities: ["image-sampling"] }),
	node("material.texture.environment", "Environment Texture", [input("vector", "vector"), input("image", "image")], [output("color", "color")], { category: "texture", requiredCapabilities: ["environment-sampling"] }),
	node("material.texture.sky", "Sky Texture", [input("sun-direction", "direction"), input("sun-elevation", "angle"), input("sun-rotation", "angle"), input("altitude", "distance"), input("air-density", "float", 1), input("dust-density", "float", 1), input("ozone-density", "float", 1)], [output("color", "color")], { category: "texture", requiredCapabilities: ["physical-sky"] }),
	node("material.texture.point-density", "Point Density", [input("object", "object"), input("radius", "distance", 0.3)], [output("density", "float"), output("color", "color")], { category: "texture", requiredCapabilities: ["point-density"] }),
	node("material.texture.ies", "IES Texture", [input("vector", "vector"), input("strength", "float", 1), input("ies", "string")], [output("factor", "factor")], { category: "texture", requiredCapabilities: ["ies-profile"] }),
	node("material.texture.gabor", "Gabor Texture", [input("vector", "vector"), input("scale", "float", 5), input("frequency", "float", 1), input("anisotropy", "factor", 0), input("orientation", "angle", 0)], [output("value", "float"), output("phase", "float"), output("intensity", "float")], { category: "texture", requiredCapabilities: ["gabor-noise"] }),
	node("material.texture.cellular-flow", "Cellular Flow Texture", [input("vector", "vector"), input("time", "time"), input("scale", "float", 5), input("velocity", "vector")], [output("color", "color"), output("velocity", "vector")], { category: "texture", timeDependent: true, requiredCapabilities: ["advected-noise"] })
]);
