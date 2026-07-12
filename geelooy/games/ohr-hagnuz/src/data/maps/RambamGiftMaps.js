/**
 * B"H
 * @module RambamGiftMaps
 * @description Unified campaign map registry assembled from focused map sets.
 *
 * No region is an island. The Awtsmoos gives every road, court, market, house,
 * and final chamber one shared world registry while each file remains small.
 */
import { CampaignMapSetA } from './CampaignMapSetA.js';
import { CampaignMapSetB } from './CampaignMapSetB.js';

export const RambamGiftMaps = {
	...CampaignMapSetA,
	...CampaignMapSetB
};

export const rambamMapById = id => RambamGiftMaps[id] || null;
export const rambamMapIds = () => Object.keys(RambamGiftMaps);
