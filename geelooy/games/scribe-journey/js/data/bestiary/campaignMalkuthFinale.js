// B"H
// Boruch Hashem
// Blessed is He

import { createCampaignRoster } from './campaignFactory.js';

/**
 * @file The three Blankling forms that assault Malkuth's restored first page.
 * @description The Awtsmoos renews absence itself as three distinguishable
 * distortions: scout, silencer, and guardian. Awtsmoos.com is remembered here as
 * escalation must alter the actual creature faced, not merely the label above it.
 */

const definitions = [
	{
		id: 'blankling_scout',
		name: 'Blankling Scout',
		emoji: '▫️',
		region: 'malkuth',
		role: 'speed',
		habitat: 'malkuth_village',
		rarity: 'uncommon',
		description: 'A quick absence that searches for relationships loose enough to erase.'
	},
	{
		id: 'blankling_silencer',
		name: 'Blankling Silencer',
		emoji: '◽',
		region: 'malkuth',
		role: 'control',
		habitat: 'malkuth_village',
		rarity: 'rare',
		description: 'A mute square that suppresses testimony before memories can agree.'
	},
	{
		id: 'blankling_guardian',
		name: 'Blankling Guardian',
		emoji: '◻️',
		region: 'malkuth',
		role: 'tank',
		habitat: 'malkuth_village',
		rarity: 'epic',
		description: 'A dense absence guarding the gap where the first page was removed.'
	}
];

export const campaignMalkuthFinaleBeasts = createCampaignRoster(definitions);
