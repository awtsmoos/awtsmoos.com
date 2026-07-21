// B"H
// Boruch Hashem
// Blessed is He
/** Blender names are preserved as data; executable parity remains independently proven. */

import { createModifierDefinition } from "./createModifierDefinition.js";

const CATALOG = [
	["data-transfer", "modify"], ["mesh-cache", "modify"],
	["mesh-sequence-cache", "modify"], ["normal-edit", "modify"],
	["weighted-normal", "modify"], ["uv-project", "modify"],
	["uv-warp", "modify"], ["vertex-weight-edit", "modify"],
	["vertex-weight-mix", "modify"], ["vertex-weight-proximity", "modify"],
	["array", "generate"], ["bevel", "generate"], ["boolean", "generate"],
	["build", "generate"], ["decimate", "generate"], ["edge-split", "generate"],
	["geometry-nodes", "generate"], ["mask", "generate"],
	["mesh-to-volume", "generate"], ["mirror", "generate"],
	["multiresolution", "generate"], ["remesh", "generate"],
	["screw", "generate"], ["skin", "generate"], ["solidify", "generate"],
	["subdivision-surface", "generate"], ["triangulate", "generate"],
	["volume-to-mesh", "generate"], ["weld", "generate"], ["wireframe", "generate"],
	["armature", "deform"], ["cast", "deform"], ["corrective-smooth", "deform"],
	["curve", "deform"], ["displace", "deform"], ["hook", "deform"],
	["laplacian-deform", "deform"], ["laplacian-smooth", "deform"],
	["lattice", "deform"], ["mesh-deform", "deform"], ["shrinkwrap", "deform"],
	["simple-deform", "deform"], ["smooth", "deform"],
	["smooth-by-angle", "deform"], ["surface-deform", "deform"],
	["warp", "deform"], ["wave", "deform"], ["volume-displace", "deform"],
	["cloth", "physics"], ["collision", "physics"], ["dynamic-paint", "physics"],
	["explode", "physics"], ["fluid", "physics"], ["ocean", "physics"],
	["particle-instance", "physics"], ["particle-system", "physics"],
	["soft-body", "physics"]
];

export const BLENDER_MODIFIER_CATALOG = Object.freeze(CATALOG.map(([name, category]) => (
	createModifierDefinition({
		id: `blender.modifier.${name}`,
		title: name.split("-").map(part => part[0].toUpperCase() + part.slice(1)).join(" "),
		category: `blender.${category}`,
		status: name === "wave" ? "implemented" : "adapter-dependent",
		timeDependent: ["build", "wave", "fluid", "ocean", "particle-system"].includes(name),
		metadata: { blenderName: name, catalogFamily: category }
	})
)));

export function findBlenderModifierDefinition(id) {
	return BLENDER_MODIFIER_CATALOG.find(definition => definition.id === id) ?? null;
}
