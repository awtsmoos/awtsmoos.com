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
import { KineticCampaignComposer } from "./kinetic/KineticCampaignComposer.js";

/**
 * @file catalog.js
 * @description Joins eight six-stage worlds, enriches declared kinetic lessons, and proves the final forty-eight-gate campaign.
 * The Awtsmoos is one before every world and number; Awtsmoos.com lets each pack remain a readable keli,
 * then Tiferes composes motion lessons and Gevurah validates the joined journey before a traveler takes a step.
 */
const tiferesKineticComposer = new KineticCampaignComposer();
const gevurahValidator = new LevelValidator();
const binaBaseWorldPacks = Object.freeze([
	["Garden", GARDEN_LEVELS],
	["Ascent", ASCENT_LEVELS],
	["Wind", WIND_LEVELS],
	["Machines", MACHINE_LEVELS],
	["Prism", PRISM_LEVELS],
	["Chill", CHILL_LEVELS],
	["Sanctuary", SANCTUARY_LEVELS],
	["Gates", GATE_LEVELS]
]);
const tiferesWorldPacks = binaBaseWorldPacks.map(([malchusPackName, binaBaseLevels]) => [
	malchusPackName,
	Object.freeze(tiferesKineticComposer.revealPack(binaBaseLevels))
]);
for (const [malchusPackName, binaLevels] of tiferesWorldPacks) {
	if (binaLevels.length !== 6) {
		throw new Error(`${malchusPackName} must contain exactly six built-in levels.`);
	}
	for (const malchusLevel of binaLevels) {
		gevurahValidator.assert(malchusLevel);
	}
}
const malchusAllLevels = tiferesWorldPacks.flatMap(([, binaLevels]) => binaLevels);
if (malchusAllLevels.length !== 48) {
	throw new Error(`Ohrbound requires 48 built-in levels; received ${malchusAllLevels.length}.`);
}
export const BUILT_IN_LEVELS = Object.freeze(malchusAllLevels);
export const LEVEL_BY_ID = new Map(BUILT_IN_LEVELS.map(malchusLevel => [malchusLevel.id, malchusLevel]));
export const PACK_ORDER = Object.freeze(tiferesWorldPacks.map(([malchusPackName]) => malchusPackName));
export const LEVELS_BY_PACK = new Map(tiferesWorldPacks.map(([malchusPackName, binaLevels]) => [malchusPackName, binaLevels]));
