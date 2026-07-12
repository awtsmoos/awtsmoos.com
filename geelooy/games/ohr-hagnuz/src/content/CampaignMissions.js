/** B"H @module CampaignMissions - ordered four-hour handcrafted campaign index. */
import { PrologueMissions } from './prologue/PrologueMissions.js';
import { VillageMissions } from './village/VillageMissions.js';
import { GardenMissions } from './garden/GardenMissions.js';
import { MarketMissions } from './market/MarketMissions.js';
import { HouseMissions } from './house/HouseMissions.js';
import { FinaleMissions } from './finale/FinaleMissions.js';

export const CampaignMissionList = [
	...PrologueMissions, ...VillageMissions, ...GardenMissions,
	...MarketMissions, ...HouseMissions, ...FinaleMissions
];

export const CampaignMissions = Object.fromEntries(CampaignMissionList.map(entry => [entry.id, entry]));
export const campaignMissionById = id => CampaignMissions[id] || null;
export const campaignMinutes = () => CampaignMissionList.reduce((sum, entry) => sum + entry.minutes, 0);
