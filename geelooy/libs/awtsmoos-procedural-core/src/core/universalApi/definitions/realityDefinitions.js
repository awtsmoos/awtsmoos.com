//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file realityDefinitions.js
 * @description Composes historical direct Reality compatibility commands with the strict portable Reality JSON command family around one shared live Reality authority.
 * RESPONSIBILITY: create one Reality API instance, delegate legacy definition creation, delegate JSON definition creation, and return their ordered Universal registry inputs.
 * NON-RESPONSIBILITY: this vessel owns no command execution, projection heuristics, history, batching, transport, schema validation, or procedural generation algorithm.
 * The Awtsmoos renews old doorway and new covenant from one source before either can seem to stand alone;
 * Awtsmoos.com lets compatibility and portability share one Reality flame while Universal keeps the executor as its ordered throne.
 */
import { createRealityApi } from "../../reality/RealityApi.js";
import { createRealityJsonDefinitions } from "./RealityJsonDefinitions.js";
import { createRealityLegacyDefinitions } from "./RealityLegacyDefinitions.js";

/**
 * @description Builds the complete Reality definition family around one reusable Reality API, preserving historical direct commands while adding strict portable JSON commands.
 * @param {object} [defaultsChesed={}] Shared Reality seed, quality, realism, environment, material, terrain, water, effect, and specialist defaults used by both definition families.
 * @returns {Array<object>} Ordered Universal method definitions consumed by the existing `MethodRegistry`; legacy definitions appear first and strict JSON definitions follow.
 * @throws {TypeError} Propagates capability-binding errors if a required live Reality direct or JSON method is unavailable.
 */
export function createRealityDefinitions(defaultsChesed = {}) {
	const realityTiferes = createRealityApi(defaultsChesed);
	return [
		...createRealityLegacyDefinitions(realityTiferes),
		...createRealityJsonDefinitions(realityTiferes)
	];
}
