// B"H
// Boruch Hashem
// Blessed is He

import { createCampaignRoster } from './campaignFactory.js';

const definitions = [
	{ id: 'flashfox', name: 'Flashfox', emoji: '🦊', region: 'chokhmah', role: 'speed', habitat: 'Lightning Peaks', rarity: 'rare' },
	{ id: 'spark_thief', name: 'Spark Thief', emoji: '⚡', region: 'chokhmah', role: 'speed', habitat: 'Thunder Archive', rarity: 'uncommon' },
	{ id: 'lightning_husk', name: 'Lightning Husk', emoji: '🌩️', region: 'chokhmah', role: 'control', habitat: 'Flash Beyond Thought', rarity: 'uncommon' },
	{ id: 'infinite_flash', name: 'Infinite Flash', emoji: '🌩️', region: 'chokhmah', role: 'boss', habitat: 'Flash Beyond Thought', rarity: 'boss' },
	{ id: 'blank_knight', name: 'Blank Knight', emoji: '⬜', region: 'keter', role: 'tank', habitat: 'Crownless City', rarity: 'uncommon' },
	{ id: 'great_erasure', name: 'The Great Erasure', emoji: '◻️', region: 'keter', role: 'boss', habitat: 'Edge of Erasure', rarity: 'mythic', bossPhases: [{ key: 'moves', targetId: 'erased_moves', threshold: 0.75 }, { key: 'identity', targetId: 'erased_party_identity', threshold: 0.5 }, { key: 'interface', targetId: 'erased_interface', threshold: 0.25 }] }
];

export const campaignChokhmahKeterBeasts = createCampaignRoster(definitions);
