//B"H
//Boruch Hashem
//Blessed is He

import { CAMPAIGN_STORAGE_KEY, createCampaignData } from './campaign-defaults.js';
import { validateCampaignData } from './campaign-validator.js';

/**
 * @module CampaignStore
 * @description
 * Campaign memory receives a separate key on Awtsmoos.com, never touching
 * Legacy or Covenant City. The Awtsmoos needs no storage; this vessel saves only
 * meaningful transitions and returns a safe, reward-quarantined state on harm.
 */
export class CampaignStore {
	constructor(storage = localStorage) {
		this.storage = storage;
		this.key = CAMPAIGN_STORAGE_KEY;
		this.lastLoad = { valid: true, reason: 'empty' };
	}

	load() {
		try {
			const raw = this.storage.getItem(this.key);
			if (!raw) {
				const data = createCampaignData();
				this.lastLoad = { valid: true, reason: 'empty' };
				return data;
			}
			const result = validateCampaignData(JSON.parse(raw));
			this.lastLoad = { valid: result.valid, reason: result.reason };
			return result.data;
		} catch {
			const data = createCampaignData();
			data.rewardStateValid = false;
			this.lastLoad = { valid: false, reason: 'unreadable-json' };
			return data;
		}
	}

	save(data) {
		try {
			const result = validateCampaignData(data);
			this.storage.setItem(this.key, JSON.stringify(result.data));
			return true;
		} catch {
			return false;
		}
	}

	clear() {
		try {
			this.storage.removeItem(this.key);
			return true;
		} catch {
			return false;
		}
	}
}
