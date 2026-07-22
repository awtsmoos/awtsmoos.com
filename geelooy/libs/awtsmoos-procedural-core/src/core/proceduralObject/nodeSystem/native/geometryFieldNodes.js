// B"H
// Boruch Hashem
// Blessed is He
/** Field and function nodes form reusable value algebra across geometry domains. */

import { input, node, output } from "./nodeDefinitionHelpers.js";

export const GEOMETRY_FIELD_NODES = Object.freeze([
	node("function.value", "Value", [input("value", "float", 0)], [output("value", "float")], { category: "input" }),
	node("function.integer", "Integer", [input("value", "integer", 0)], [output("value", "integer")], { category: "input" }),
	node("function.boolean", "Boolean", [input("value", "boolean", false)], [output("value", "boolean")], { category: "input" }),
	node("function.vector", "Vector", [input("value", "vector", [0, 0, 0])], [output("value", "vector")], { category: "input" }),
	node("function.color", "Color", [input("value", "color", [0.5, 0.5, 0.5, 1])], [output("value", "color")], { category: "input" }),
	node("function.string", "String", [input("value", "string", "")], [output("value", "string")], { category: "input" }),
	node("function.math", "Math", [input("a", "field<float>", 0), input("b", "field<float>", 0), input("c", "field<float>", 0)], [output("value", "field<float>")], { category: "math", operations: ["add", "subtract", "multiply", "divide", "power", "logarithm", "minimum", "maximum", "sine", "cosine", "tangent", "absolute", "floor", "ceil", "fraction", "modulo", "snap", "wrap", "ping-pong", "compare", "smooth-min", "smooth-max"] }),
	node("function.vector-math", "Vector Math", [input("a", "field<vector>"), input("b", "field<vector>"), input("c", "field<vector>"), input("scale", "field<float>", 1)], [output("vector", "field<vector>"), output("value", "field<float>")], { category: "vector", operations: ["add", "subtract", "multiply", "divide", "cross", "dot", "distance", "length", "scale", "normalize", "reflect", "refract", "project", "faceforward", "snap", "wrap"] }),
	node("function.compare", "Compare", [input("a", "field<opaque>"), input("b", "field<opaque>"), input("epsilon", "field<float>", 0.001)], [output("result", "field<boolean>")], { category: "logic" }),
	node("function.boolean-math", "Boolean Math", [input("a", "field<boolean>"), input("b", "field<boolean>")], [output("boolean", "field<boolean>")], { category: "logic", operations: ["and", "or", "not", "nand", "nor", "xor", "xnor", "imply"] }),
	node("function.switch", "Switch", [input("switch", "field<boolean>"), input("false", "field<opaque>"), input("true", "field<opaque>")], [output("output", "field<opaque>")], { category: "logic" }),
	node("function.index-switch", "Index Switch", [input("index", "field<integer>"), input("items", "bundle")], [output("output", "field<opaque>")], { category: "logic" }),
	node("function.menu-switch", "Menu Switch", [input("menu", "menu"), input("items", "bundle")], [output("output", "field<opaque>")], { category: "logic" }),
	node("function.map-range", "Map Range", [input("value", "field<float>"), input("from-min", "field<float>", 0), input("from-max", "field<float>", 1), input("to-min", "field<float>", 0), input("to-max", "field<float>", 1), input("steps", "field<float>", 4)], [output("result", "field<float>")], { category: "converter" }),
	node("function.clamp", "Clamp", [input("value", "field<float>"), input("minimum", "field<float>", 0), input("maximum", "field<float>", 1)], [output("result", "field<float>")], { category: "converter" }),
	node("function.random-value", "Random Value", [input("minimum", "opaque"), input("maximum", "opaque"), input("probability", "factor", 0.5), input("id", "field<integer>"), input("seed", "integer", 0)], [output("value", "field<opaque>")], { category: "random" }),
	node("function.accumulate-field", "Accumulate Field", [input("value", "field<opaque>"), input("group-id", "field<integer>")], [output("leading", "field<opaque>"), output("trailing", "field<opaque>"), output("total", "field<opaque>")], { category: "field" }),
	node("function.evaluate-at-index", "Evaluate at Index", [input("index", "field<integer>"), input("value", "field<opaque>")], [output("value", "field<opaque>")], { category: "field" }),
	node("function.field-at-index", "Field at Index", [input("index", "field<integer>"), input("value", "field<opaque>")], [output("value", "field<opaque>")], { category: "field" }),
	node("function.align-rotation-to-vector", "Align Rotation to Vector", [input("rotation", "field<rotation>"), input("factor", "field<factor>", 1), input("vector", "field<vector>")], [output("rotation", "field<rotation>")], { category: "rotation" }),
	node("function.rotate-vector", "Rotate Vector", [input("vector", "field<vector>"), input("rotation", "field<rotation>"), input("center", "field<point>")], [output("vector", "field<vector>")], { category: "rotation" }),
	node("function.combine-transform", "Combine Transform", [input("translation", "translation"), input("rotation", "rotation"), input("scale", "vector", [1, 1, 1])], [output("transform", "matrix")], { category: "transform" }),
	node("function.separate-transform", "Separate Transform", [input("transform", "matrix")], [output("translation", "translation"), output("rotation", "rotation"), output("scale", "vector")], { category: "transform" }),
	node("function.transform-point", "Transform Point", [input("point", "point"), input("transform", "matrix")], [output("point", "point")], { category: "transform" })
]);
