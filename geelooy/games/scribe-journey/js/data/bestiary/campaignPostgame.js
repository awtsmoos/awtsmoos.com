// B"H
// Boruch Hashem
// Blessed is He

import { createCampaignRoster } from './campaignFactory.js';

const definitions = [
	{ id: 'primordial_letter', name: 'First Letter', emoji: 'א', region: 'postgame', role: 'balanced', habitat: 'Orchard Before Names', rarity: 'mythic' },
	{ id: 'primordial_melody', name: 'First Melody', emoji: '🎼', region: 'postgame', role: 'support', habitat: 'Orchard Before Names', rarity: 'mythic' },
	{ id: 'primordial_garden', name: 'First Garden', emoji: '🌱', region: 'postgame', role: 'tank', habitat: 'Orchard Before Names', rarity: 'mythic' },
	{ id: 'first_song', name: 'First Song', emoji: '🎵', region: 'postgame', role: 'support', habitat: 'Orchard Before Names', rarity: 'mythic' },
	{ id: 'silence_before_song', name: 'Silence Before Song', emoji: '◌', region: 'postgame', role: 'boss', habitat: 'Orchard Before Names', rarity: 'superboss' }
];

export const campaignPostgameBeasts = createCampaignRoster(definitions);
