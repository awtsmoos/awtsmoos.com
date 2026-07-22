// B"H
// Boruch Hashem
// Blessed is He
/** Material converter nodes expose color, vector, mapping, and spectrum algebra. */

import { input, node, output } from "./nodeDefinitionHelpers.js";

export const MATERIAL_CONVERTER_NODES = Object.freeze([
	node("material.converter.mix", "Mix", [input("factor", "factor", 0.5), input("a", "opaque"), input("b", "opaque")], [output("result", "opaque")], { category: "converter" }),
	node("material.converter.color-ramp", "Color Ramp", [input("factor", "factor", 0.5), input("ramp", "bundle")], [output("color", "color"), output("alpha", "float")], { category: "color" }),
	node("material.converter.invert", "Invert Color", [input("factor", "factor", 1), input("color", "color")], [output("color", "color")], { category: "color" }),
	node("material.converter.hue-saturation", "Hue Saturation Value", [input("hue", "float", 0.5), input("saturation", "float", 1), input("value", "float", 1), input("factor", "factor", 1), input("color", "color")], [output("color", "color")], { category: "color" }),
	node("material.converter.gamma", "Gamma", [input("color", "color"), input("gamma", "float", 1)], [output("color", "color")], { category: "color" }),
	node("material.converter.brightness-contrast", "Brightness Contrast", [input("color", "color"), input("brightness", "float", 0), input("contrast", "float", 0)], [output("color", "color")], { category: "color" }),
	node("material.converter.rgb-curves", "RGB Curves", [input("factor", "factor", 1), input("color", "color"), input("curve", "bundle")], [output("color", "color")], { category: "color" }),
	node("material.converter.vector-curves", "Vector Curves", [input("factor", "factor", 1), input("vector", "vector"), input("curve", "bundle")], [output("vector", "vector")], { category: "vector" }),
	node("material.converter.separate-color", "Separate Color", [input("color", "color")], [output("red", "float"), output("green", "float"), output("blue", "float"), output("alpha", "float")], { category: "converter" }),
	node("material.converter.combine-color", "Combine Color", [input("red", "float"), input("green", "float"), input("blue", "float"), input("alpha", "float", 1)], [output("color", "color")], { category: "converter" }),
	node("material.converter.separate-vector", "Separate Vector", [input("vector", "vector")], [output("x", "float"), output("y", "float"), output("z", "float")], { category: "converter" }),
	node("material.converter.combine-vector", "Combine Vector", [input("x", "float"), input("y", "float"), input("z", "float")], [output("vector", "vector")], { category: "converter" }),
	node("material.converter.mapping", "Mapping", [input("vector", "vector"), input("location", "translation"), input("rotation", "rotation"), input("scale", "vector", [1, 1, 1])], [output("vector", "vector")], { category: "vector" }),
	node("material.converter.vector-transform", "Vector Transform", [input("vector", "vector")], [output("vector", "vector")], { category: "vector" }),
	node("material.converter.math", "Math", [input("a", "float"), input("b", "float"), input("c", "float")], [output("value", "float")], { category: "math" }),
	node("material.converter.vector-math", "Vector Math", [input("a", "vector"), input("b", "vector"), input("c", "vector"), input("scale", "float", 1)], [output("vector", "vector"), output("value", "float")], { category: "vector" }),
	node("material.converter.map-range", "Map Range", [input("value", "float"), input("from-min", "float", 0), input("from-max", "float", 1), input("to-min", "float", 0), input("to-max", "float", 1), input("steps", "float", 4)], [output("result", "float")], { category: "converter" }),
	node("material.converter.clamp", "Clamp", [input("value", "float"), input("minimum", "float", 0), input("maximum", "float", 1)], [output("result", "float")], { category: "converter" }),
	node("material.converter.wavelength", "Wavelength", [input("wavelength", "wavelength", 500)], [output("color", "color")], { category: "spectrum" }),
	node("material.converter.blackbody", "Blackbody", [input("temperature", "temperature", 6500)], [output("color", "color")], { category: "spectrum" }),
	node("material.converter.spectral-upsampling", "Spectral Upsampling", [input("color", "color")], [output("spectrum", "spectrum")], { category: "spectrum", requiredCapabilities: ["spectral-rendering"] }),
	node("material.converter.spectral-integration", "Spectral Integration", [input("spectrum", "spectrum")], [output("color", "color")], { category: "spectrum", requiredCapabilities: ["spectral-rendering"] })
]);
