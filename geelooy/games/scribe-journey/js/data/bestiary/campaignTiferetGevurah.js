// B"H
// Boruch Hashem
// Blessed is He

import { createCampaignRoster } from './campaignFactory.js';

const definitions = [
	{ id: 'mirror_double', name: 'Mirror Double', emoji: '🪞', region: 'tiferet', role: 'control', habitat: 'Mirror Lake', rarity: 'uncommon' },
	{ id: 'reflection_gnawer', name: 'Reflection Gnawer', emoji: '🫥', region: 'tiferet', role: 'speed', habitat: 'Sunbridge', rarity: 'common' },
	{ id: 'distress_drawn_creature', name: 'Distress-Drawn Creature', emoji: '💔', region: 'tiferet', role: 'control', habitat: 'Neria’s Trail', rarity: 'uncommon' },
	{ id: 'discord_shade', name: 'Discord Shade', emoji: '🎭', region: 'tiferet', role: 'control', habitat: 'Divided Heart Palace', rarity: 'uncommon' },
	{ id: 'twin_crowned_seraph', name: 'Twin-Crowned Seraph', emoji: '👼', region: 'tiferet', role: 'boss', habitat: 'Divided Heart Palace', rarity: 'boss', bossPhases: [{ key: 'crown_1', targetId: 'twin_crowns', threshold: 0.7 }, { key: 'crown_2', targetId: 'twin_crowns', threshold: 0.35 }] },
	{ id: 'chain_hound', name: 'Chain Hound', emoji: '⛓️', region: 'gevurah', role: 'speed', habitat: 'Chain Pass', rarity: 'uncommon' },
	{ id: 'corrupted_advisor', name: 'Corrupted Advisor', emoji: '🟥', region: 'gevurah', role: 'control', habitat: 'Fortress of Measure', rarity: 'elite' },
	{ id: 'judgment_colossus', name: 'Judgment Colossus', emoji: '⚖️', region: 'gevurah', role: 'boss', habitat: 'Fortress of Measure', rarity: 'boss', bossPhases: [{ key: 'chain_left', targetId: 'scale_chain', threshold: 0.7 }, { key: 'chain_right', targetId: 'scale_chain', threshold: 0.35 }] }
];

export const campaignTiferetGevurahBeasts = createCampaignRoster(definitions);
