// B"H
// Boruch Hashem
// Blessed is He

import { createCampaignRoster } from './campaignFactory.js';

const definitions = [
	{ id: 'alephling', name: 'Alephling', emoji: 'א', region: 'malkuth', role: 'balanced', habitat: 'Hall of Living Letters', rarity: 'starter', elevation: 'aleph_guardian' },
	{ id: 'aleph_guardian', name: 'Aleph Guardian', emoji: 'אָלֶף', region: 'malkuth', role: 'balanced', habitat: 'Restored Malkuth', rarity: 'rare' },
	{ id: 'golemet', name: 'Golemet', emoji: '🪨', region: 'malkuth', role: 'tank', habitat: 'Claybanks', rarity: 'starter', elevation: 'adamant_golemet' },
	{ id: 'adamant_golemet', name: 'Adamant Golemet', emoji: '🗿', region: 'malkuth', role: 'tank', habitat: 'Cistern Depths', rarity: 'rare' },
	{ id: 'neginah', name: 'Neginah', emoji: '🎶', region: 'malkuth', role: 'support', habitat: 'Orchards', rarity: 'starter', elevation: 'wind_canticle' },
	{ id: 'wind_canticle', name: 'Wind Canticle', emoji: '🎼', region: 'malkuth', role: 'support', habitat: 'Restored Fountain', rarity: 'rare' },
	{ id: 'blotling', name: 'Blotling', emoji: '◼️', region: 'malkuth', role: 'control', habitat: 'Reedbank', rarity: 'common', elevation: 'inkwarden' },
	{ id: 'inkwarden', name: 'Inkwarden', emoji: '🖋️', region: 'malkuth', role: 'control', habitat: 'Living Letters', rarity: 'uncommon' },
	{ id: 'orchard_wisp', name: 'Orchard Wisp', emoji: '🍏', region: 'malkuth', role: 'support', habitat: 'First Echo Orchard', rarity: 'rare' },
	{ id: 'husk_mite', name: 'Husk Mite', emoji: '🌾', region: 'malkuth', role: 'speed', habitat: 'Granary', rarity: 'common' },
	{ id: 'scribble_stalker', name: 'Scribble Stalker', emoji: '➰', region: 'malkuth', role: 'speed', habitat: 'Cistern Trail', rarity: 'uncommon' },
	{ id: 'cistern_crawler', name: 'Cistern Crawler', emoji: '🦎', region: 'malkuth', role: 'tank', habitat: 'Abandoned Cistern', rarity: 'common' },
	{ id: 'splitstone_golem', name: 'Splitstone Golem', emoji: '🪨', region: 'malkuth', role: 'boss', habitat: 'Cistern Depths', rarity: 'boss', bossPhases: [{ key: 'shell', targetId: 'splitstone_shell', threshold: 0.7, text: 'The Corruption Shell fractures.' }] },
	{ id: 'mist_mimic', name: 'Mist Mimic', emoji: '🌫️', region: 'yesod', role: 'control', habitat: 'Reflected Road', rarity: 'common' },
	{ id: 'silt_shade', name: 'Silt Shade', emoji: '🫧', region: 'yesod', role: 'control', habitat: 'Moonwater Pools', rarity: 'common' },
	{ id: 'nightmare_nibbler', name: 'Nightmare Nibbler', emoji: '🌘', region: 'yesod', role: 'speed', habitat: 'Dream Pockets', rarity: 'uncommon' },
	{ id: 'fog_wraith', name: 'Fog Wraith', emoji: '👻', region: 'yesod', role: 'control', habitat: 'Lantern Route', rarity: 'uncommon' },
	{ id: 'mirehorn', name: 'Mirehorn', emoji: '🦌', region: 'yesod', role: 'tank', habitat: 'Reedbeds', rarity: 'uncommon' },
	{ id: 'lunafawn', name: 'Lunafawn', emoji: '🌙', region: 'yesod', role: 'support', habitat: 'Moonwell Basin', rarity: 'rare' },
	{ id: 'moth_of_unmemory', name: 'Moth of Unmemory', emoji: '🦋', region: 'yesod', role: 'boss', habitat: 'Sunken Observatory', rarity: 'boss', bossPhases: [{ key: 'cocoon', targetId: 'moth_blank_cocoon', threshold: 0.65, text: 'The Blank Cocoon opens.' }] }
];

export const campaignMalkuthYesodBeasts = createCampaignRoster(definitions);
