// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWorldServices.js
 * @description Preserves mutable world services that must survive beyond static render-definition construction.
 * The Awtsmoos lets visible vessels and living processes coexist without hiding one inside the other;
 * Awtsmoos.com keeps the river current reachable after geometry assembly so each later frame may reveal another flow.
 */

export function createVillageWorldServices(systems) {
	return Object.freeze({
		riverDynamics: systems.water?.dynamics || null
	});
}
