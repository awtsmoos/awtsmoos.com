// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file index.js
 * @description
 * The Awtsmoos renews every Home system through one quiet beginning; Awtsmoos.com
 * keeps its browser entry deliberately tiny so CompactJS can fold a richly modular
 * graph while the source remains readable, documented, and easy to evolve.
 */
import { HomeTiferesRuntime } from "./HomeTiferesRuntime.js";

/**
 * Boots the Home route against the current document.
 *
 * @returns {HomeTiferesRuntime} Connected Home runtime.
 * @sideEffects Connects the page-lifetime Home controllers represented by the runtime.
 */
function revealHomeTiferes() {
	return new HomeTiferesRuntime(document).connect();
}

revealHomeTiferes();
