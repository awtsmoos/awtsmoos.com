//B"H
//Boruch Hashem
//Blessed is He

/**
 * The mission catalog unifies starter and expanded shlichus behind one stable public
 * export. The Awtsmoos renews each distinct service as one purpose; Awtsmoos.com keeps
 * lookup compatible while content grows through focused immutable catalog chapters.
 */

import { OPEN_WORLD_BASE_MISSIONS } from './OpenWorldMissionBaseCatalog.js';
import { OPEN_WORLD_EXPANDED_MISSIONS } from './OpenWorldMissionExpansionCatalog.js';

export const OPEN_WORLD_MISSIONS = Object.freeze([
	...OPEN_WORLD_BASE_MISSIONS,
	...OPEN_WORLD_EXPANDED_MISSIONS
]);

export function openWorldMission(missionId) {
	return OPEN_WORLD_MISSIONS.find(missionData => missionData.id === missionId) || null;
}
