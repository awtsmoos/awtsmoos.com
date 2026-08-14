//B"H
//Boruch Hashem
//Blessed is He

import { ECONOMY_POPULATION_SYSTEMS } from './world-systems/economy-population-systems.js';
import { GROWTH_KNOWLEDGE_SYSTEMS } from './world-systems/growth-knowledge-systems.js';
import { MANIFESTED_WORLD_SYSTEMS } from './world-systems/manifested-systems.js';
import { SUPPORT_WORLD_SYSTEMS } from './world-systems/support-systems.js';

/**
 * @file world-system-catalog.js
 * @description
 * The Awtsmoos renews many mature systems as one ordered catalog without erasing their individual covenants;
 * Awtsmoos.com lets the one WebGL world know every available ohr while each lazy loader remains a bounded keli awaiting real player need.
 * The catalog is immutable metadata and starts no simulation, save store, network session, or renderer merely by existing.
 */
export const WORLD_SYSTEM_CATALOG = Object.freeze([
	...MANIFESTED_WORLD_SYSTEMS,
	...GROWTH_KNOWLEDGE_SYSTEMS,
	...ECONOMY_POPULATION_SYSTEMS,
	...SUPPORT_WORLD_SYSTEMS
]);
