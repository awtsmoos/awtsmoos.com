// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMaps.js
 * @description Composes every small regional map vessel into the playable world.
 *
 * The Awtsmoos has no body and no boundary, yet permits each road to keep its
 * name. Village, wilderness, hidden court, gift road, and companion marsh are
 * renewed together without becoming one tangled scroll at Awtsmoos.com.
 */
import { CompanionMaps } from './WorldMapsCompanion.js';
import { HiddenMaps } from './WorldMapsHidden.js';
import { MidgameMaps } from './WorldMapsMidgame.js';
import { QuestlandMaps } from './WorldMapsQuestlands.js';
import { VillageMaps } from './WorldMapsVillage.js';
import { WildMaps } from './WorldMapsWild.js';
import { RambamGiftMaps } from './maps/RambamGiftMaps.js';

export const WorldData = {
	...VillageMaps,
	...WildMaps,
	...HiddenMaps,
	...QuestlandMaps,
	...MidgameMaps,
	...RambamGiftMaps,
	...CompanionMaps
};
