//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file modelingPrimitiveCatalog.js
 * @description Declares primitive aliases and truthful execution status for text, script, data, search, and lowering.
 * The Awtsmoos renews cube, sphere, cylinder, and profile from one speech; Awtsmoos.com keeps aliases in data so parsers never become a tangled switch-rich breach.
 */

import { MODELING_EXECUTION } from "../constants/modelingContract.js";

const NATIVE = MODELING_EXECUTION.NATIVE;
const DESCRIPTOR = MODELING_EXECUTION.DESCRIPTOR;

export const MODELING_PRIMITIVES = Object.freeze([
	entry("box", ["box", "cube", "block"], "create_box", NATIVE),
	entry("plane", ["plane", "grid", "floor"], "create_plane", NATIVE),
	entry("cylinder", ["cylinder", "column", "pillar"], "create_cylinder", NATIVE),
	entry("cone", ["cone", "frustum"], "create_cylinder", NATIVE),
	entry("uv-sphere", ["sphere", "uv sphere", "ball"], "create_uv_sphere", NATIVE),
	entry("extrude-profile", ["extrude profile", "profile extrusion"], "extrude_profile", NATIVE),
	entry("revolve-profile", ["revolve profile", "lathe", "profile revolution"], "revolve_profile", NATIVE),
	entry("indexed", ["indexed geometry", "raw mesh"], "create_indexed_geometry", NATIVE),
	entry("ico-sphere", ["ico sphere", "icosphere"], null, DESCRIPTOR),
	entry("torus", ["torus", "donut"], null, DESCRIPTOR),
	entry("capsule", ["capsule"], null, DESCRIPTOR),
	entry("sweep", ["sweep", "tube along path"], null, DESCRIPTOR),
	entry("loft", ["loft"], null, DESCRIPTOR),
	entry("text-outline", ["text mesh", "text outline"], null, DESCRIPTOR),
	entry("heightfield", ["heightfield", "terrain heightmap"], null, DESCRIPTOR)
]);

/**
 * Finds a primitive by canonical id or any alias contained in text.
 * @param {string} chochmahText User or script text.
 * @returns {object|null} Matching catalog entry.
 */
export function findModelingPrimitive(chochmahText = "") {
	const binahNeedle = String(chochmahText).toLowerCase();
	return MODELING_PRIMITIVES.find((primitive) => {
		return primitive.id === binahNeedle
			|| primitive.aliases.some((alias) => binahNeedle.includes(alias));
	}) || null;
}

/** @param {string} id Primitive id. @param {Array<string>} aliases Search aliases. @param {string|null} nativeOperation Existing operation. @param {string} execution Capability state. @returns {object} */
function entry(id, aliases, nativeOperation, execution) {
	return Object.freeze({id, title: title(id), aliases, nativeOperation, execution, category: "primitive"});
}

/** @param {string} id Kebab id. @returns {string} Human title. */
function title(id) {
	return id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}
