// B"H
// Boruch Hashem
// Blessed is He
/** Curve nodes expose path construction, resampling, handles, and profile sweeps. */

import { input, node, output } from "./nodeDefinitionHelpers.js";

export const GEOMETRY_CURVE_NODES = Object.freeze([
	node("geometry.curve.line", "Curve Line", [input("start", "point", [0, 0, 0]), input("end", "point", [0, 0, 1])], [output("curve", "geometry")], { category: "curve-primitive", topology: "create" }),
	node("geometry.curve.bezier-segment", "Bezier Segment", [input("start", "point"), input("start-handle", "point"), input("end-handle", "point"), input("end", "point")], [output("curve", "geometry")], { category: "curve-primitive", topology: "create" }),
	node("geometry.curve.circle", "Curve Circle", [input("resolution", "integer", 32), input("radius", "distance", 1)], [output("curve", "geometry")], { category: "curve-primitive", topology: "create" }),
	node("geometry.curve.spiral", "Spiral", [input("resolution", "integer", 32), input("rotations", "float", 2), input("start-radius", "distance", 1), input("end-radius", "distance", 1), input("height", "distance", 2)], [output("curve", "geometry")], { category: "curve-primitive", topology: "create" }),
	node("geometry.curve.star", "Star", [input("points", "integer", 8), input("inner-radius", "distance", 0.5), input("outer-radius", "distance", 1)], [output("curve", "geometry")], { category: "curve-primitive", topology: "create" }),
	node("geometry.curve.quadrilateral", "Quadrilateral", [input("width", "distance", 1), input("height", "distance", 1)], [output("curve", "geometry")], { category: "curve-primitive", topology: "create" }),
	node("geometry.curve.curve-to-mesh", "Curve to Mesh", [input("curve", "geometry"), input("profile", "geometry"), input("fill-caps", "boolean", false)], [output("mesh", "geometry")], { category: "conversion", topology: "replace" }),
	node("geometry.curve.mesh-to-curve", "Mesh to Curve", [input("mesh", "geometry"), input("selection", "field<boolean>", true)], [output("curve", "geometry")], { category: "conversion", topology: "replace" }),
	node("geometry.curve.curve-to-points", "Curve to Points", [input("curve", "geometry"), input("count", "integer", 10), input("length", "distance", 0.1)], [output("points", "geometry"), output("tangent", "field<direction>"), output("normal", "field<normal>"), output("rotation", "field<rotation>")], { category: "conversion", topology: "replace" }),
	node("geometry.curve.resample", "Resample Curve", [input("curve", "geometry"), input("selection", "field<boolean>", true), input("count", "integer", 10), input("length", "distance", 0.1)], [output("curve", "geometry")], { category: "curve", topology: "change" }),
	node("geometry.curve.subdivide", "Subdivide Curve", [input("curve", "geometry"), input("cuts", "field<integer>", 1)], [output("curve", "geometry")], { category: "curve", topology: "change" }),
	node("geometry.curve.trim", "Trim Curve", [input("curve", "geometry"), input("start", "factor", 0), input("end", "factor", 1)], [output("curve", "geometry")], { category: "curve", topology: "change" }),
	node("geometry.curve.fillet", "Fillet Curve", [input("curve", "geometry"), input("radius", "field<distance>", 0.1), input("count", "integer", 4)], [output("curve", "geometry")], { category: "curve", topology: "change" }),
	node("geometry.curve.set-radius", "Set Curve Radius", [input("curve", "geometry"), input("selection", "field<boolean>", true), input("radius", "field<float>", 1)], [output("curve", "geometry")], { category: "curve", topology: "preserve" }),
	node("geometry.curve.set-tilt", "Set Curve Tilt", [input("curve", "geometry"), input("selection", "field<boolean>", true), input("tilt", "field<angle>", 0)], [output("curve", "geometry")], { category: "curve", topology: "preserve" }),
	node("geometry.curve.set-handle-positions", "Set Handle Positions", [input("curve", "geometry"), input("selection", "field<boolean>", true), input("position", "field<point>"), input("offset", "field<vector>")], [output("curve", "geometry")], { category: "curve", topology: "preserve" }),
	node("geometry.curve.sample", "Sample Curve", [input("curve", "geometry"), input("factor", "factor", 0), input("length", "distance", 0)], [output("position", "point"), output("tangent", "direction"), output("normal", "normal")], { category: "sampling" }),
	node("geometry.curve.deform-curves-on-surface", "Deform Curves on Surface", [input("curves", "geometry"), input("surface", "geometry")], [output("curves", "geometry")], { category: "curve", topology: "preserve" }),
	node("geometry.curve.interpolate-curves", "Interpolate Curves", [input("guide-curves", "geometry"), input("guide-up", "field<vector>"), input("points", "geometry")], [output("curves", "geometry")], { category: "curve", topology: "create" }),
	node("geometry.curve.set-spline-cyclic", "Set Spline Cyclic", [input("curve", "geometry"), input("selection", "field<boolean>", true), input("cyclic", "field<boolean>", true)], [output("curve", "geometry")], { category: "curve", topology: "preserve" })
]);
