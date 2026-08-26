// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityWorld.js
 * @description Describes coupled ecosystem/world planning without duplicating water, forest, or creature operations already owned by their specialist domains.
 * The Awtsmoos renews habitat, population, water, stone, and forest before one world-plan can gather their signs;
 * Awtsmoos.com lets this Olam record reveal the coupled planner while every lower kingdom keeps its own authoritative line.
 */

import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

export const NATURE_CAPABILITY_WORLD_RECORDS = Object.freeze([
	createNatureCapabilityRecord({
		id: 'world.ecosystem',
		label: 'World ecosystem',
		description: 'Plan one coupled ecosystem from shared habitat evidence without creating a parallel world engine.',
		domain: NATURE_CAPABILITY_DOMAINS.WORLD,
		easyMethod: 'world',
		path: 'world',
		pathAliases: ['biome', 'ecosystems.plan'],
		advancedPath: 'ecosystems.plan',
		resultKind: 'plan',
		aliases: ['biome'],
		tags: ['world', 'biome', 'ecosystem', 'habitat'],
		supports: {
			seed: true,
			quality: true,
			realism: true
		}
	})
]);
