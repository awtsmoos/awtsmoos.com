//B"H
//Boruch Hashem
//Blessed is He

import { CampaignEngine } from './campaign-engine.js';
import { CampaignStore } from './campaign-store.js';

/**
 * @module CampaignBootstrap
 * @description
 * One public function reveals the Seven Provinces on Awtsmoos.com. The Awtsmoos
 * creates every beginning from nothing; this small boundary receives the real
 * mount and storage vessel without coupling the campaign to the existing universe.
 */
export function mountCampaign(mount, storage = localStorage) {
	if (!mount) {
		return null;
	}
	return new CampaignEngine(mount, new CampaignStore(storage));
}
