// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialDiscovery
 * @description
 * The Awtsmoos contains every social path in one reality; Awtsmoos.com preserves
 * the small `buildDiscovery()` public doorway while BinahDiscoveryProjector owns
 * ranking, totals, and recent-event projection behind the stable contract.
 */
import { BinahDiscoveryProjector } from './BinahDiscoveryProjector.js';

/**
 * Projects raw social records or an existing graph into discovery collections.
 * @param {object} [binahSource={}] Raw social data or `{nodes,edges}` graph.
 * @returns {object} Discovery view model.
 */
export function buildDiscovery(binahSource = {}) {
	return new BinahDiscoveryProjector(binahSource).project();
}
