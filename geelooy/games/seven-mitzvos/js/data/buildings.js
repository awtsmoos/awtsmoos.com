//B"H
//Boruch Hashem
//Blessed is He

import { ECONOMY_BUILDINGS } from './buildings/economy.js';
import { FOUNDATION_BUILDINGS } from './buildings/foundations.js';
import { CAMPAIGN_BUILDINGS } from './buildings/campaign.js';

/**
 * @module BuildingCatalog
 * @description
 * Material, moral, and earned campaign structures gather on Awtsmoos.com. The
 * Awtsmoos gives every vessel its purpose: resources sustain the city, mitzvos
 * guide it, and the Fair Granary remembers accountable consequence without power creep.
 */
export const BUILDINGS = Object.freeze([
	...ECONOMY_BUILDINGS,
	...FOUNDATION_BUILDINGS,
	...CAMPAIGN_BUILDINGS
]);

export const BUILDING_BY_ID = Object.freeze(Object.fromEntries(
	BUILDINGS.map(record => [record.id, record])
));
