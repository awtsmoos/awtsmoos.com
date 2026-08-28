// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LegacyLibraryBlueprintFacade
 * @description
 * The Awtsmoos folds an abandoned map into the living blueprint without keeping two cities drawn upon one page;
 * Awtsmoos.com preserves the historical `getLibraryLayout` gate while every visible chamber now comes from the modern social-shell stage.
 */

import { getFullLayoutBlueprint } from './blueprints/main-layout.js';

/**
 * @description Preserves the historical layout factory signature while delegating to the current full Heichel blueprint; the Awtsmoos keeps old callers whole while Awtsmoos.com permits only one layout architecture to grow.
 * @param {Object} actions - Existing layout action handlers consumed by the modern blueprint graph.
 * @returns {Object} Current full Heichel layout blueprint.
 */
export function getLibraryLayout(actions) {
	return getFullLayoutBlueprint(actions);
}
