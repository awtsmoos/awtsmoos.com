// B"H
// Boruch Hashem
// Blessed is He
/** Mesh nodes create and transform topology without making vertices authoritative. */

import { input, multiInput, node, output } from "./nodeDefinitionHelpers.js";

export const GEOMETRY_MESH_NODES = Object.freeze([
	node("geometry.mesh.cube", "Cube", [input("size", "vector", [1, 1, 1]), input("vertices", "vector", [2, 2, 2])], [output("mesh", "geometry")], { category: "mesh-primitive", topology: "create" }),
	node("geometry.mesh.cylinder", "Cylinder", [input("vertices", "integer", 32), input("radius", "distance", 1), input("depth", "distance", 2)], [output("mesh", "geometry"), output("top", "field<boolean>"), output("side", "field<boolean>")], { category: "mesh-primitive", topology: "create" }),
	node("geometry.mesh.cone", "Cone", [input("vertices", "integer", 32), input("radius-top", "distance", 0), input("radius-bottom", "distance", 1), input("depth", "distance", 2)], [output("mesh", "geometry")], { category: "mesh-primitive", topology: "create" }),
	node("geometry.mesh.grid", "Grid", [input("size-x", "distance", 1), input("size-y", "distance", 1), input("vertices-x", "integer", 3), input("vertices-y", "integer", 3)], [output("mesh", "geometry")], { category: "mesh-primitive", topology: "create" }),
	node("geometry.mesh.ico-sphere", "Icosphere", [input("radius", "distance", 1), input("subdivisions", "integer", 2)], [output("mesh", "geometry")], { category: "mesh-primitive", topology: "create" }),
	node("geometry.mesh.uv-sphere", "UV Sphere", [input("segments", "integer", 32), input("rings", "integer", 16), input("radius", "distance", 1)], [output("mesh", "geometry")], { category: "mesh-primitive", topology: "create" }),
	node("geometry.mesh.circle", "Mesh Circle", [input("vertices", "integer", 32), input("radius", "distance", 1)], [output("mesh", "geometry")], { category: "mesh-primitive", topology: "create" }),
	node("geometry.mesh.line", "Mesh Line", [input("count", "integer", 10), input("start", "point", [0, 0, 0]), input("offset", "vector", [1, 0, 0])], [output("mesh", "geometry")], { category: "mesh-primitive", topology: "create" }),
	node("geometry.mesh.set-position", "Set Position", [input("geometry", "geometry"), input("selection", "field<boolean>", true), input("position", "field<point>"), input("offset", "field<vector>", [0, 0, 0])], [output("geometry", "geometry")], { category: "geometry", topology: "preserve" }),
	node("geometry.mesh.transform", "Transform Geometry", [input("geometry", "geometry"), input("translation", "translation", [0, 0, 0]), input("rotation", "rotation", [0, 0, 0]), input("scale", "vector", [1, 1, 1])], [output("geometry", "geometry")], { category: "geometry", topology: "preserve" }),
	node("geometry.mesh.extrude", "Extrude Mesh", [input("mesh", "geometry"), input("selection", "field<boolean>", true), input("offset", "field<vector>", [0, 0, 0]), input("offset-scale", "field<float>", 1)], [output("mesh", "geometry"), output("top", "field<boolean>"), output("side", "field<boolean>")], { category: "mesh", topology: "change" }),
	node("geometry.mesh.subdivide", "Subdivide Mesh", [input("mesh", "geometry"), input("level", "integer", 1)], [output("mesh", "geometry")], { category: "mesh", topology: "change" }),
	node("geometry.mesh.triangulate", "Triangulate", [input("mesh", "geometry"), input("selection", "field<boolean>", true), input("minimum-vertices", "integer", 4)], [output("mesh", "geometry")], { category: "mesh", topology: "change" }),
	node("geometry.mesh.dual", "Dual Mesh", [input("mesh", "geometry"), input("keep-boundaries", "boolean", false)], [output("dual-mesh", "geometry")], { category: "mesh", topology: "change" }),
	node("geometry.mesh.flip-faces", "Flip Faces", [input("mesh", "geometry"), input("selection", "field<boolean>", true)], [output("mesh", "geometry")], { category: "mesh", topology: "preserve" }),
	node("geometry.mesh.scale-elements", "Scale Elements", [input("geometry", "geometry"), input("selection", "field<boolean>", true), input("scale", "field<float>", 1), input("center", "field<point>")], [output("geometry", "geometry")], { category: "mesh", topology: "preserve" }),
	node("geometry.mesh.split-edges", "Split Edges", [input("mesh", "geometry"), input("selection", "field<boolean>", true)], [output("mesh", "geometry")], { category: "mesh", topology: "change" }),
	node("geometry.mesh.merge-by-distance", "Merge by Distance", [input("geometry", "geometry"), input("selection", "field<boolean>", true), input("distance", "distance", 0.001)], [output("geometry", "geometry")], { category: "mesh", topology: "change" }),
	node("geometry.mesh.boolean", "Mesh Boolean", [input("mesh-a", "geometry"), multiInput("mesh-b", "geometry"), input("self-intersection", "boolean", false), input("hole-tolerant", "boolean", false)], [output("mesh", "geometry"), output("intersecting-edges", "field<boolean>")], { category: "mesh", topology: "change", requiredCapabilities: ["robust-csg"] }),
	node("geometry.mesh.remesh-voxel", "Voxel Remesh", [input("mesh", "geometry"), input("voxel-size", "distance", 0.1), input("adaptivity", "factor", 0)], [output("mesh", "geometry")], { category: "mesh", topology: "replace", requiredCapabilities: ["volume-remesh"] }),
	node("geometry.mesh.raycast", "Raycast", [input("target-geometry", "geometry"), input("source-position", "field<point>"), input("ray-direction", "field<direction>"), input("ray-length", "field<distance>", 100)], [output("hit", "field<boolean>"), output("hit-position", "field<point>"), output("hit-normal", "field<normal>"), output("hit-distance", "field<distance>")], { category: "sampling" }),
	node("geometry.mesh.proximity", "Geometry Proximity", [input("target", "geometry"), input("source-position", "field<point>")], [output("position", "field<point>"), output("distance", "field<distance>")], { category: "sampling" }),
	node("geometry.mesh.sample-index", "Sample Index", [input("geometry", "geometry"), input("value", "field<opaque>"), input("index", "field<integer>")], [output("value", "field<opaque>")], { category: "sampling" }),
	node("geometry.mesh.sample-nearest", "Sample Nearest", [input("geometry", "geometry"), input("sample-position", "field<point>")], [output("index", "field<integer>")], { category: "sampling" }),
	node("geometry.mesh.capture-attribute", "Capture Attribute", [input("geometry", "geometry"), input("value", "field<opaque>")], [output("geometry", "geometry"), output("attribute", "field<opaque>")], { category: "attribute" }),
	node("geometry.mesh.store-named-attribute", "Store Named Attribute", [input("geometry", "geometry"), input("selection", "field<boolean>", true), input("name", "string"), input("value", "field<opaque>")], [output("geometry", "geometry")], { category: "attribute" }),
	node("geometry.mesh.remove-named-attribute", "Remove Named Attribute", [input("geometry", "geometry"), input("name", "string")], [output("geometry", "geometry")], { category: "attribute" }),
	node("geometry.mesh.set-material", "Set Material", [input("geometry", "geometry"), input("selection", "field<boolean>", true), input("material", "material")], [output("geometry", "geometry")], { category: "material" }),
	node("geometry.mesh.replace-material", "Replace Material", [input("geometry", "geometry"), input("old", "material"), input("new", "material")], [output("geometry", "geometry")], { category: "material" })
]);
