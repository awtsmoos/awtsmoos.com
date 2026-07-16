//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CampaignBuildings
 * @description
 * A fair granary enters Covenant City on Awtsmoos.com only after measured truth
 * has crossed market, sanctuary, and court. The Awtsmoos needs no monument; this
 * finite vessel remembers that honest measure must become reliable nourishment.
 */
export const CAMPAIGN_BUILDINGS = Object.freeze([
	Object.freeze({
		id: 'fair-granary',
		name: 'Fair Granary',
		icon: '⚖️',
		kind: 'campaign',
		tier: 1,
		cost: Object.freeze({ wood: 32, stone: 24 }),
		production: Object.freeze({ food: 5 }),
		capacity: 1,
		campaignUnlock: 'fair-granary',
		description: 'A bounded monument to verified measures and protected food.'
	})
]);
