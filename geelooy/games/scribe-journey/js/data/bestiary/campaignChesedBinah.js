// B"H
// Boruch Hashem
// Blessed is He

import { createCampaignRoster } from './campaignFactory.js';

const definitions = [
	{ id: 'current_wraith', name: 'Current Wraith', emoji: '🌊', region: 'chesed', role: 'control', habitat: 'Floodplain', rarity: 'uncommon' },
	{ id: 'flood_husk', name: 'Flood Husk', emoji: '🪸', region: 'chesed', role: 'tank', habitat: 'Overflowing River', rarity: 'uncommon' },
	{ id: 'endless_host', name: 'Endless Host', emoji: '🍽️', region: 'chesed', role: 'boss', habitat: 'Thousand Doors', rarity: 'boss' },
	{ id: 'pattern_eater', name: 'Pattern Eater', emoji: '🧶', region: 'binah', role: 'control', habitat: 'Loom District', rarity: 'uncommon' },
	{ id: 'formless_larva', name: 'Formless Larva', emoji: '🫧', region: 'binah', role: 'speed', habitat: 'Womb of Stone', rarity: 'uncommon' },
	{ id: 'mater_dolor', name: 'Mater Dolor', emoji: '🖤', region: 'binah', role: 'boss', habitat: 'Womb of Stone', rarity: 'boss' }
];

export const campaignChesedBinahBeasts = createCampaignRoster(definitions);
