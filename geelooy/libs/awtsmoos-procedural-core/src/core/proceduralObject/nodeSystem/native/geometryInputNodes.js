// B"H
// Boruch Hashem
// Blessed is He
/** Geometry input nodes expose context, attributes, objects, and scene time. */

import { input, node, output } from "./nodeDefinitionHelpers.js";

export const GEOMETRY_INPUT_NODES = Object.freeze([
	node("geometry.input.position", "Position", [], [output("position", "field<point>")], { category: "input" }),
	node("geometry.input.normal", "Normal", [], [output("normal", "field<normal>")], { category: "input" }),
	node("geometry.input.index", "Index", [], [output("index", "field<integer>")], { category: "input" }),
	node("geometry.input.id", "ID", [], [output("id", "field<integer>")], { category: "input" }),
	node("geometry.input.radius", "Radius", [], [output("radius", "field<float>")], { category: "input" }),
	node("geometry.input.scene-time", "Scene Time", [], [output("seconds", "time"), output("frame", "float")], { category: "input", timeDependent: true }),
	node("geometry.input.is-viewport", "Is Viewport", [], [output("value", "boolean")], { category: "input" }),
	node("geometry.input.named-attribute", "Named Attribute", [input("name", "string")], [output("value", "field<opaque>"), output("exists", "boolean")], { category: "attribute" }),
	node("geometry.input.object-info", "Object Info", [input("object", "object"), input("as-instance", "boolean", false)], [output("geometry", "geometry"), output("location", "translation"), output("rotation", "rotation"), output("scale", "vector")], { category: "scene" }),
	node("geometry.input.collection-info", "Collection Info", [input("collection", "collection"), input("separate-children", "boolean", false), input("reset-children", "boolean", false)], [output("instances", "geometry")], { category: "scene" }),
	node("geometry.input.self-object", "Self Object", [], [output("object", "object")], { category: "scene" }),
	node("geometry.input.active-camera", "Active Camera", [], [output("object", "object")], { category: "scene" }),
	node("geometry.input.material-selection", "Material Selection", [input("material", "material")], [output("selection", "field<boolean>")], { category: "material" }),
	node("geometry.input.spline-length", "Spline Length", [], [output("length", "field<distance>"), output("point-count", "field<integer>")], { category: "curve" }),
	node("geometry.input.curve-handle-positions", "Curve Handle Positions", [], [output("left", "field<point>"), output("right", "field<point>")], { category: "curve" }),
	node("geometry.input.edge-neighbors", "Edge Neighbors", [], [output("face-count", "field<integer>")], { category: "mesh" }),
	node("geometry.input.vertex-neighbors", "Vertex Neighbors", [], [output("vertex-count", "field<integer>"), output("face-count", "field<integer>")], { category: "mesh" }),
	node("geometry.input.face-area", "Face Area", [], [output("area", "field<float>")], { category: "mesh" }),
	node("geometry.input.face-is-planar", "Face Is Planar", [input("threshold", "angle", 0.01)], [output("planar", "field<boolean>")], { category: "mesh" }),
	node("geometry.input.shortest-edge-path", "Shortest Edge Paths", [input("end-vertex", "field<boolean>"), input("edge-cost", "field<float>", 1)], [output("next-vertex", "field<integer>"), output("total-cost", "field<float>")], { category: "mesh" })
]);
