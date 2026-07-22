// B"H
// Boruch Hashem
// Blessed is He
/** Instance and point nodes preserve repetition without prematurely duplicating geometry. */

import { input, multiInput, node, output } from "./nodeDefinitionHelpers.js";

export const GEOMETRY_INSTANCE_NODES = Object.freeze([
	node("geometry.instance.distribute-points-on-faces", "Distribute Points on Faces", [input("mesh", "geometry"), input("selection", "field<boolean>", true), input("distance-min", "distance", 0), input("density", "field<float>", 1), input("seed", "integer", 0)], [output("points", "geometry"), output("normal", "field<normal>"), output("rotation", "field<rotation>")], { category: "point", topology: "create" }),
	node("geometry.instance.distribute-points-in-volume", "Distribute Points in Volume", [input("volume", "volume"), input("density", "float", 1), input("seed", "integer", 0)], [output("points", "geometry")], { category: "point", topology: "create" }),
	node("geometry.instance.points", "Points", [input("count", "integer", 1), input("position", "field<point>"), input("radius", "field<float>", 0.1)], [output("geometry", "geometry")], { category: "point", topology: "create" }),
	node("geometry.instance.mesh-to-points", "Mesh to Points", [input("mesh", "geometry"), input("selection", "field<boolean>", true), input("position", "field<point>"), input("radius", "field<float>", 0.05)], [output("points", "geometry")], { category: "conversion", topology: "replace" }),
	node("geometry.instance.points-to-vertices", "Points to Vertices", [input("points", "geometry"), input("selection", "field<boolean>", true)], [output("mesh", "geometry")], { category: "conversion", topology: "replace" }),
	node("geometry.instance.points-to-volume", "Points to Volume", [input("points", "geometry"), input("density", "field<float>", 1), input("radius", "field<distance>", 0.5), input("voxel-size", "distance", 0.1)], [output("volume", "volume")], { category: "conversion", topology: "replace" }),
	node("geometry.instance.instance-on-points", "Instance on Points", [input("points", "geometry"), input("selection", "field<boolean>", true), input("instance", "geometry"), input("pick-instance", "boolean", false), input("instance-index", "field<integer>"), input("rotation", "field<rotation>"), input("scale", "field<vector>", [1, 1, 1])], [output("instances", "geometry")], { category: "instance", topology: "create" }),
	node("geometry.instance.realize", "Realize Instances", [input("geometry", "geometry"), input("selection", "field<boolean>", true), input("realize-all", "boolean", true), input("depth", "integer", 0)], [output("geometry", "geometry")], { category: "instance", topology: "replace" }),
	node("geometry.instance.rotate", "Rotate Instances", [input("instances", "geometry"), input("selection", "field<boolean>", true), input("rotation", "field<rotation>"), input("pivot", "field<point>")], [output("instances", "geometry")], { category: "instance", topology: "preserve" }),
	node("geometry.instance.scale", "Scale Instances", [input("instances", "geometry"), input("selection", "field<boolean>", true), input("scale", "field<vector>", [1, 1, 1]), input("center", "field<point>")], [output("instances", "geometry")], { category: "instance", topology: "preserve" }),
	node("geometry.instance.translate", "Translate Instances", [input("instances", "geometry"), input("selection", "field<boolean>", true), input("translation", "field<vector>")], [output("instances", "geometry")], { category: "instance", topology: "preserve" }),
	node("geometry.instance.input-rotation", "Instance Rotation", [], [output("rotation", "field<rotation>")], { category: "instance-input" }),
	node("geometry.instance.input-scale", "Instance Scale", [], [output("scale", "field<vector>")], { category: "instance-input" }),
	node("geometry.instance.input-transform", "Instance Transform", [], [output("transform", "field<matrix>")], { category: "instance-input" }),
	node("geometry.instance.set-transform", "Set Instance Transform", [input("instances", "geometry"), input("selection", "field<boolean>", true), input("transform", "field<matrix>")], [output("instances", "geometry")], { category: "instance", topology: "preserve" }),
	node("geometry.instance.join", "Join Geometry", [multiInput("geometry", "geometry")], [output("geometry", "geometry")], { category: "geometry", topology: "combine" }),
	node("geometry.instance.separate-components", "Separate Components", [input("geometry", "geometry")], [output("mesh", "geometry"), output("curve", "geometry"), output("point-cloud", "geometry"), output("instances", "geometry"), output("volume", "volume")], { category: "geometry" }),
	node("geometry.instance.delete", "Delete Geometry", [input("geometry", "geometry"), input("selection", "field<boolean>", true)], [output("geometry", "geometry")], { category: "geometry", topology: "change" })
]);
