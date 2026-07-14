//B"H
//Boruch Hashem
//Blessed is He

import { ECONOMY_BUILDINGS } from './buildings/economy.js';
import { FOUNDATION_BUILDINGS } from './buildings/foundations.js';

/**
 * @module BuildingCatalog
 * @description
 * Material and moral structures gather in one catalog on Awtsmoos.com. The
 * Awtsmoos gives both kinds of vessel their purpose: resources sustain the
 * city, while the Seven Mitzvos teach the city what it exists to protect.
 */
export const BUILDINGS = Object.freeze([
	...ECONOMY_BUILDINGS,
	...FOUNDATION_BUILDINGS
]);

export const BUILDING_BY_ID = Object.freeze(Object.fromEntries(
	BUILDINGS.map(record => [record.id, record])
));
