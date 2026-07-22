// B"H
// Boruch Hashem
// Blessed is He
/** Zone declarations open simulation, repeat, foreach, and bake semantics. */

import { input, node, output } from "./nodeDefinitionHelpers.js";

export const GEOMETRY_ZONE_NODES = Object.freeze([
	node("geometry.zone.simulation-input", "Simulation Input", [input("state", "bundle"), input("delta-time", "time")], [output("state", "bundle"), output("delta-time", "time"), output("skip", "boolean")], { category: "zone", zoneRole: "simulation-input", timeDependent: true }),
	node("geometry.zone.simulation-output", "Simulation Output", [input("state", "bundle"), input("skip", "boolean", false)], [output("state", "bundle")], { category: "zone", zoneRole: "simulation-output", timeDependent: true }),
	node("geometry.zone.repeat-input", "Repeat Input", [input("iterations", "integer", 1), input("state", "bundle")], [output("iteration", "integer"), output("state", "bundle")], { category: "zone", zoneRole: "repeat-input" }),
	node("geometry.zone.repeat-output", "Repeat Output", [input("state", "bundle")], [output("state", "bundle")], { category: "zone", zoneRole: "repeat-output" }),
	node("geometry.zone.foreach-input", "For Each Geometry Element Input", [input("geometry", "geometry"), input("selection", "field<boolean>", true), input("state", "bundle")], [output("element", "geometry"), output("index", "integer"), output("state", "bundle")], { category: "zone", zoneRole: "foreach-input" }),
	node("geometry.zone.foreach-output", "For Each Geometry Element Output", [input("geometry", "geometry"), input("state", "bundle")], [output("geometry", "geometry"), output("state", "bundle")], { category: "zone", zoneRole: "foreach-output" }),
	node("geometry.zone.bake", "Bake", [input("geometry", "geometry"), input("state", "bundle"), input("time", "time")], [output("geometry", "geometry"), output("state", "bundle"), output("baked", "boolean")], { category: "cache", requiredCapabilities: ["persistent-bake-cache"] }),
	node("geometry.zone.viewer", "Viewer", [input("geometry", "geometry"), input("value", "field<opaque>")], [], { category: "debug" }),
	node("geometry.zone.group-input", "Group Input", [], [output("interface", "bundle")], { category: "group" }),
	node("geometry.zone.group-output", "Group Output", [input("interface", "bundle")], [], { category: "group" })
]);
