/** B"H @module CampaignScenes - deterministic scene registry for the full campaign. */
import { PrologueScenes } from './prologue/PrologueScenes.js';
import { VillageScenes } from './village/VillageScenes.js';
import { GardenScenes } from './garden/GardenScenes.js';
import { MarketScenes } from './market/MarketScenes.js';
import { HouseScenes } from './house/HouseScenes.js';
import { FinaleScenes } from './finale/FinaleScenes.js';

export const CampaignSceneList = [
	...PrologueScenes, ...VillageScenes, ...GardenScenes,
	...MarketScenes, ...HouseScenes, ...FinaleScenes
];
export const CampaignScenes = Object.fromEntries(CampaignSceneList.map(entry => [entry.id, entry]));
export const campaignSceneById = id => CampaignScenes[id] || null;
