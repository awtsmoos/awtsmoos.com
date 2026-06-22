/**
 * B"H
 * @module WorldMaps
 * Barrel that composes the small region map files.
 *
 * Chapter 205: The map received a new artery. The Awtsmoos has no body and no
 * form, yet the road east now leads from the first village into the Garden of
 * Ungiven Things, the Court of Rightful Receivers, and the House of Forgetting.
 */
import { VillageMaps } from './WorldMapsVillage.js';
import { WildMaps } from './WorldMapsWild.js';
import { HiddenMaps } from './WorldMapsHidden.js';
import { QuestlandMaps } from './WorldMapsQuestlands.js';
import { MidgameMaps } from './WorldMapsMidgame.js';
import { RambamGiftMaps } from './maps/RambamGiftMaps.js';

export const WorldData = {
  ...VillageMaps,
  ...WildMaps,
  ...HiddenMaps,
  ...QuestlandMaps,
  ...MidgameMaps,
  ...RambamGiftMaps
};
