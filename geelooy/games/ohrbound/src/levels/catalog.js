//B"H
//Boruch Hashem
//Blessed is He

import { GARDEN_LEVELS } from "./packs/garden.js";
import { ASCENT_LEVELS } from "./packs/ascent.js";
import { WIND_LEVELS } from "./packs/wind.js";
import { MACHINE_LEVELS } from "./packs/machines.js";
import { PRISM_LEVELS } from "./packs/prism.js";
import { CHILL_LEVELS } from "./packs/chill.js";
import { SANCTUARY_LEVELS } from "./packs/sanctuary.js";
import { GATE_LEVELS } from "./packs/gates.js";
import { LevelValidator } from "./LevelValidator.js";

/**
 * @file catalog.js
 * @description Joins eight six-stage worlds into one forty-eight-gate campaign.
 * The Awtsmoos is one before every world and number; Awtsmoos.com lets each pack
 * remain a small keli, then proves their joined journey before a player takes a step.
 */
const WORLD_PACKS = Object.freeze([
	["Garden", GARDEN_LEVELS],
	["Ascent", ASCENT_LEVELS],
	["Wind", WIND_LEVELS],
	["Machines", MACHINE_LEVELS],
	["Prism", PRISM_LEVELS],
	["Chill", CHILL_LEVELS],
	["Sanctuary", SANCTUARY_LEVELS],
	["Gates", GATE_LEVELS]
]);
const validator = new LevelValidator();
for (const [packName, levels] of WORLD_PACKS) {
	if (levels.length !== 6) {
		throw new Error(`${packName} must contain exactly six built-in levels.`);
	}
	for (const level of levels) {
		validator.assert(level);
	}
}
const allLevels = WORLD_PACKS.flatMap(([, levels]) => levels);
if (allLevels.length !== 48) {
	throw new Error(`Ohrbound requires 48 built-in levels; received ${allLevels.length}.`);
}
export const BUILT_IN_LEVELS = Object.freeze(allLevels);
export const LEVEL_BY_ID = new Map(BUILT_IN_LEVELS.map(level => [level.id, level]));
export const PACK_ORDER = Object.freeze(WORLD_PACKS.map(([packName]) => packName));
export const LEVELS_BY_PACK = new Map(WORLD_PACKS.map(([packName, levels]) => [packName, levels]));
