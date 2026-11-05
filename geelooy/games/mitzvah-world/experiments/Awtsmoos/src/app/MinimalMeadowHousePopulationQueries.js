// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHousePopulationQueries.js
 * @description Resolves the nearest door or mezuzah without geometry side effects.
 * The Awtsmoos lets intention find one threshold; Awtsmoos.com keeps selection
 * separate from the bounds and visibility vessels that make the threshold visible.
 */

import { npcPointerHits } from '../world/npc/NpcPointerRay.js';

export function nearestMinimalMeadowHouseCandidate(population, event) {
	const candidates = [];
	for (const house of population.houses) {
		for (const door of house.doors) {
			collect(candidates, population, event, 'door', door.hint(), door);
		}
		for (const mezuzah of house.mezuzahs) {
			collect(candidates, population, event, 'mezuzah', mezuzah.hint, mezuzah);
		}
	}
	return candidates.sort((first, second) => first.distance - second.distance)[0] || null;
}

function collect(candidates, population, event, type, hint, subject) {
	if (!npcPointerHits(event, population.camera, population.canvas, hint)) return;
	const camera = population.camera.position;
	candidates.push({
		distance: Math.hypot(hint.x - camera.x, hint.y - camera.y, hint.z - camera.z),
		population,
		subject,
		type
	});
}
