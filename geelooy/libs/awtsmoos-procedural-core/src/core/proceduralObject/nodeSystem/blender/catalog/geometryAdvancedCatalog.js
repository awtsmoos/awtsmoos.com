// B"H
// Boruch Hashem
// Blessed is He
/** Advanced Geometry Nodes carry topology, sampling, volumes, and zone boundaries. */

import { catalogNode as node, catalogSocket as socket } from "./catalogSockets.js";
const geometry = id => socket(id, "geometry");
const fieldFloat = id => socket(id, "float", { fieldCapable: true });
const fieldVector = id => socket(id, "vector", { fieldCapable: true });
const fieldBoolean = id => socket(id, "boolean", { fieldCapable: true });

export const BLENDER_GEOMETRY_ADVANCED_NODES = Object.freeze([
	node("GeometryNodeMeshBoolean", "mesh", [geometry("mesh-1"), socket("mesh-2", "geometry", { multiInput: true })], [geometry("mesh")]),
	node("GeometryNodeExtrudeMesh", "mesh", [geometry("mesh"), fieldBoolean("selection"), fieldVector("offset"), fieldFloat("offset-scale")], [geometry("mesh"), fieldBoolean("top"), fieldBoolean("side")]),
	node("GeometryNodeSubdivideMesh", "mesh", [geometry("mesh"), socket("level", "integer")], [geometry("mesh")]),
	node("GeometryNodeTriangulate", "mesh", [geometry("mesh"), fieldBoolean("selection"), socket("minimum-vertices", "integer")], [geometry("mesh")]),
	node("GeometryNodeMergeByDistance", "mesh", [geometry("geometry"), fieldBoolean("selection"), fieldFloat("distance")], [geometry("geometry")]),
	node("GeometryNodeDeleteGeometry", "geometry", [geometry("geometry"), fieldBoolean("selection")], [geometry("geometry")]),
	node("GeometryNodeRaycast", "sample", [geometry("target-geometry"), socket("attribute", "opaque", { fieldCapable: true }), fieldVector("source-position"), fieldVector("ray-direction"), fieldFloat("ray-length")], [fieldBoolean("is-hit"), fieldVector("hit-position"), fieldVector("hit-normal"), fieldFloat("hit-distance"), socket("attribute", "opaque", { fieldCapable: true })]),
	node("GeometryNodeProximity", "sample", [geometry("target"), fieldVector("source-position")], [fieldVector("position"), fieldFloat("distance")]),
	node("GeometryNodeSampleIndex", "sample", [geometry("geometry"), socket("value", "opaque", { fieldCapable: true }), socket("index", "integer", { fieldCapable: true })], [socket("value", "opaque", { fieldCapable: true })]),
	node("GeometryNodeGeometryToInstance", "instances", [socket("geometry", "geometry", { multiInput: true })], [geometry("instances")]),
	node("GeometryNodePointsToVolume", "volume", [geometry("points"), fieldFloat("density"), fieldFloat("radius"), socket("voxel-amount", "float")], [geometry("volume")]),
	node("GeometryNodeVolumeToMesh", "volume", [geometry("volume"), socket("voxel-size", "distance"), socket("threshold", "float"), socket("adaptivity", "factor")], [geometry("mesh")]),
	node("GeometryNodeSimulationInput", "zones", [geometry("geometry")], [geometry("geometry"), socket("delta-time", "time")], { zoneRole: "simulation-input", minimumBlenderVersion: "3.6.0" }),
	node("GeometryNodeSimulationOutput", "zones", [geometry("geometry"), socket("skip", "boolean")], [geometry("geometry")], { zoneRole: "simulation-output", minimumBlenderVersion: "3.6.0" }),
	node("GeometryNodeRepeatInput", "zones", [geometry("geometry"), socket("iterations", "integer")], [geometry("geometry"), socket("iteration", "integer")], { zoneRole: "repeat-input", minimumBlenderVersion: "4.0.0" }),
	node("GeometryNodeRepeatOutput", "zones", [geometry("geometry")], [geometry("geometry")], { zoneRole: "repeat-output", minimumBlenderVersion: "4.0.0" }),
	node("GeometryNodeForeachGeometryElementInput", "zones", [geometry("geometry"), fieldBoolean("selection")], [geometry("element"), socket("index", "integer")], { zoneRole: "foreach-input", minimumBlenderVersion: "4.3.0" }),
	node("GeometryNodeForeachGeometryElementOutput", "zones", [geometry("element")], [geometry("geometry")], { zoneRole: "foreach-output", minimumBlenderVersion: "4.3.0" }),
	node("GeometryNodeSwitch", "utilities", [socket("switch", "boolean", { fieldCapable: true }), socket("false", "opaque", { fieldCapable: true }), socket("true", "opaque", { fieldCapable: true })], [socket("output", "opaque", { fieldCapable: true })]),
	node("GeometryNodeIndexSwitch", "utilities", [socket("index", "integer", { fieldCapable: true }), socket("items", "opaque", { multiInput: true })], [socket("output", "opaque", { fieldCapable: true })])
]);
