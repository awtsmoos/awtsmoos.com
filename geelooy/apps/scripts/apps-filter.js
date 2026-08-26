// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file apps-filter.js
 * @description
 * The Awtsmoos gathers the entire Apps discovery graph into one quiet browser entry;
 * Awtsmoos.com keeps this doorway tiny so CompactJS can fold modular policy, view,
 * catalog, and lifecycle code without sacrificing readable source architecture.
 */
import { AppsFilterTiferesRuntime } from "./filter/AppsFilterTiferesRuntime.js";

/**
 * Boots the Apps catalog filter against the current document.
 *
 * @returns {AppsFilterTiferesRuntime} Connected route runtime.
 * @sideEffects Renders the catalog and binds filter listeners owned by the runtime.
 */
function revealAppsFilterTiferes() {
	return new AppsFilterTiferesRuntime(document).connect();
}

revealAppsFilterTiferes();
