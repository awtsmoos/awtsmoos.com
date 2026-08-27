// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	registerSceneCreationHandlers
} from "./sceneCreationHandlers.js";
import {
	registerSceneHierarchyHandlers
} from "./sceneHierarchyHandlers.js";
import {
	registerSceneMetadataHandlers
} from "./sceneMetadataHandlers.js";
import {
	registerSceneTimelineHandlers
} from "./sceneTimelineHandlers.js";

/**
 * Registers renderer-neutral scene and assembly operations.
 *
 * @param {ProceduralOperationRegistry} registry Trusted registry.
 * @returns {ProceduralOperationRegistry} Same registry.
 */
export function registerSceneHandlers(registry) {
	registerSceneCreationHandlers(registry);
	registerSceneHierarchyHandlers(registry);
	registerSceneMetadataHandlers(registry);
	registerSceneTimelineHandlers(registry);
	return registry;
}
