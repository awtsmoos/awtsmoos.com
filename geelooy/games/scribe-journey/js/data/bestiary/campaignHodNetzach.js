// B"H
// Boruch Hashem
// Blessed is He

import { createCampaignRoster } from './campaignFactory.js';

const definitions = [
	{ id: 'paper_kite', name: 'Paper Kite', emoji: '🪁', region: 'hod', role: 'speed', habitat: 'Archive Rooftops', rarity: 'common' },
	{ id: 'rust_gnat', name: 'Rust Gnat', emoji: '🪰', region: 'hod', role: 'speed', habitat: 'Letterworks', rarity: 'common' },
	{ id: 'index_leech', name: 'Index Leech', emoji: '🔖', region: 'hod', role: 'control', habitat: 'Broken Index', rarity: 'uncommon' },
	{ id: 'grammarch', name: 'Grammarch', emoji: '📐', region: 'hod', role: 'control', habitat: 'Rewritten Streets', rarity: 'rare' },
	{ id: 'margin_crawler', name: 'Margin Crawler', emoji: '📎', region: 'hod', role: 'tank', habitat: 'Infinite Stacks', rarity: 'uncommon' },
	{ id: 'lexicon_tyrant', name: 'Lexicon Tyrant', emoji: '📕', region: 'hod', role: 'boss', habitat: 'Infinite Stacks', rarity: 'boss', bossPhases: [{ key: 'seal_1', targetId: 'classification_seals', threshold: 0.8 }, { key: 'seal_2', targetId: 'classification_seals', threshold: 0.55 }, { key: 'seal_3', targetId: 'classification_seals', threshold: 0.3 }] },
	{ id: 'thorn_sprite', name: 'Thorn Sprite', emoji: '🌵', region: 'netzach', role: 'speed', habitat: 'Rootbound Camp', rarity: 'common' },
	{ id: 'bloombeast', name: 'Bloombeast', emoji: '🌺', region: 'netzach', role: 'tank', habitat: 'Blooming Battlefield', rarity: 'uncommon' },
	{ id: 'vinebound_duelist', name: 'Vinebound Duelist', emoji: '🌿', region: 'netzach', role: 'balanced', habitat: 'Blooming Battlefield', rarity: 'uncommon' },
	{ id: 'nectar_thief', name: 'Nectar Thief', emoji: '🐝', region: 'netzach', role: 'speed', habitat: 'Flower Fields', rarity: 'common' },
	{ id: 'rootbound_husk', name: 'Rootbound Husk', emoji: '🪵', region: 'netzach', role: 'tank', habitat: 'Thornheart Grove', rarity: 'uncommon' },
	{ id: 'regal_briar', name: 'Regal Briar', emoji: '🌹', region: 'netzach', role: 'boss', habitat: 'Thornheart Grove', rarity: 'boss', bossPhases: [{ key: 'vine_1', targetId: 'crown_vine_layer', threshold: 0.85 }, { key: 'vine_2', targetId: 'crown_vine_layer', threshold: 0.65 }, { key: 'vine_3', targetId: 'crown_vine_layer', threshold: 0.45 }, { key: 'vine_4', targetId: 'crown_vine_layer', threshold: 0.25 }] }
];

export const campaignHodNetzachBeasts = createCampaignRoster(definitions);
