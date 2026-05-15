/**
 * B"H
 * @module WorldMaps
 * Barrel that composes the small region map files.
 */
import { VillageMaps } from './WorldMapsVillage.js';
import { WildMaps } from './WorldMapsWild.js';
import { HiddenMaps } from './WorldMapsHidden.js';
import { QuestlandMaps } from './WorldMapsQuestlands.js';
import { MidgameMaps } from './WorldMapsMidgame.js';

export const WorldData = {
  ...VillageMaps,
  ...WildMaps,
  ...HiddenMaps,
  ...QuestlandMaps,
  ...MidgameMaps
};
