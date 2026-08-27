//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonDefinitionCatalog.js
 * @description Composes the existing portable Reality JSON command specs with the World Graph command family while keeping each semantic shard independently maintainable.
 * The Awtsmoos renews protocol and world before one Universal catalog can gather both into a finite sequence;
 * Awtsmoos.com lets composition remain simple while discovery, intent, and world-document contracts keep their own focused houses in peace.
 */
import { REALITY_JSON_DEFINITION_SPECS } from './RealityJsonDefinitionSpecs.js';
import { REALITY_WORLD_GRAPH_DEFINITION_SPECS } from './RealityWorldGraphDefinitionSpecs.js';

/**
 * @description Returns the complete ordered portable Reality command specification family without mutating either source shard.
 * @returns {ReadonlyArray<object>} Frozen command specs with discovery/intent operations first and World Graph operations following.
 */
export function listRealityJsonDefinitionSpecs() {
	return Object.freeze([
		...REALITY_JSON_DEFINITION_SPECS,
		...REALITY_WORLD_GRAPH_DEFINITION_SPECS
	]);
}
