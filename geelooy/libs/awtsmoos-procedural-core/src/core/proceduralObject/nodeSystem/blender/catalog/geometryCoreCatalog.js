// B"H
// Boruch Hashem
// Blessed is He
/** Core Geometry Nodes reveal mesh, curve, instance, field, and material intent. */

import { catalogNode as node, catalogSocket as socket } from "./catalogSockets.js";
const geometry = id => socket(id, "geometry");
const fieldFloat = id => socket(id, "float", { fieldCapable: true });
const fieldVector = id => socket(id, "vector", { fieldCapable: true });
const fieldBoolean = id => socket(id, "boolean", { fieldCapable: true });

export const BLENDER_GEOMETRY_CORE_NODES = Object.freeze([
	node("GeometryNodeJoinGeometry", "geometry", [socket("geometry", "geometry", { multiInput: true })], [geometry("geometry")]),
	node("GeometryNodeTransform", "geometry", [geometry("geometry"), socket("translation", "vector"), socket("rotation", "rotation"), socket("scale", "vector")], [geometry("geometry")]),
	node("GeometryNodeSetPosition", "geometry", [geometry("geometry"), fieldBoolean("selection"), fieldVector("position"), fieldVector("offset")], [geometry("geometry")]),
	node("GeometryNodeRealizeInstances", "instances", [geometry("geometry"), fieldBoolean("selection"), socket("depth", "integer")], [geometry("geometry")]),
	node("GeometryNodeInstanceOnPoints", "instances", [geometry("points"), fieldBoolean("selection"), geometry("instance"), socket("pick-instance", "boolean"), fieldFloat("instance-index"), fieldVector("rotation"), fieldVector("scale")], [geometry("instances")]),
	node("GeometryNodeDistributePointsInVolume", "points", [geometry("volume"), fieldFloat("density"), socket("seed", "integer")], [geometry("points")]),
	node("GeometryNodeDistributePointsOnFaces", "points", [geometry("mesh"), fieldBoolean("selection"), fieldFloat("distance-min"), fieldFloat("density"), socket("seed", "integer")], [geometry("points"), fieldVector("normal"), fieldVector("rotation")]),
	node("GeometryNodeMeshCube", "mesh-primitives", [socket("size", "vector"), socket("vertices-x", "integer"), socket("vertices-y", "integer"), socket("vertices-z", "integer")], [geometry("mesh")]),
	node("GeometryNodeMeshUVSphere", "mesh-primitives", [socket("segments", "integer"), socket("rings", "integer"), socket("radius", "distance")], [geometry("mesh")]),
	node("GeometryNodeCurvePrimitiveSpiral", "curve-primitives", [socket("resolution", "integer"), socket("rotations", "float"), socket("start-radius", "distance"), socket("end-radius", "distance"), socket("height", "distance")], [geometry("curve")]),
	node("GeometryNodeCurveToMesh", "curve", [geometry("curve"), geometry("profile-curve"), socket("fill-caps", "boolean")], [geometry("mesh")]),
	node("GeometryNodeResampleCurve", "curve", [geometry("curve"), fieldBoolean("selection"), socket("count", "integer"), socket("length", "distance")], [geometry("curve")]),
	node("GeometryNodeTrimCurve", "curve", [geometry("curve"), fieldFloat("start"), fieldFloat("end")], [geometry("curve")]),
	node("GeometryNodeFillCurve", "curve", [geometry("curve")], [geometry("mesh")]),
	node("GeometryNodeSetMaterial", "material", [geometry("geometry"), fieldBoolean("selection"), socket("material", "material")], [geometry("geometry")]),
	node("GeometryNodeStoreNamedAttribute", "attributes", [geometry("geometry"), fieldBoolean("selection"), socket("name", "string"), socket("value", "opaque", { fieldCapable: true })], [geometry("geometry")]),
	node("GeometryNodeInputNamedAttribute", "attributes", [socket("name", "string")], [socket("attribute", "opaque", { fieldCapable: true }), fieldBoolean("exists")]),
	node("GeometryNodeInputPosition", "input", [], [fieldVector("position")]),
	node("GeometryNodeInputIndex", "input", [], [socket("index", "integer", { fieldCapable: true })]),
	node("GeometryNodeInputNormal", "input", [], [fieldVector("normal")])
]);
