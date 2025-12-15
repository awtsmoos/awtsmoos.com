
// B"H
// js/data/items/tribe_items.js

export const tribeItems = {
    // The Stones of the Hoshen (Breastplate) - Passive Buff Items
    'stone_nofech': { id: 'stone_nofech', name: 'Nofech (Judah)', desc: 'Turquoise stone. PASSIVE: +10% Attack Damage.', type: 'key_item', isQuestItem: true, passive: {stat: 'damage_mult', amount: 1.1} },
    'stone_sapir': { id: 'stone_sapir', name: 'Sapir (Yissachar)', desc: 'Sapphire stone. PASSIVE: +20% XP Gain.', type: 'key_item', isQuestItem: true, passive: {stat: 'xp_mult', amount: 1.2} },
    'stone_yahalom': { id: 'stone_yahalom', name: 'Yahalom (Zevulun)', desc: 'Diamond stone. PASSIVE: +20% Money Drops.', type: 'key_item', isQuestItem: true, passive: {stat: 'money_mult', amount: 1.2} },
    'stone_leshem': { id: 'stone_leshem', name: 'Leshem (Dan)', desc: 'Opal stone. PASSIVE: Critical Hit Chance.', type: 'key_item', isQuestItem: true, passive: {stat: 'crit_chance', amount: 0.1} },
    'stone_shvo': { id: 'stone_shvo', name: 'Shvo (Naftali)', desc: 'Agate stone. PASSIVE: Speed/Diligence Boost.', type: 'key_item', isQuestItem: true, passive: {stat: 'diligence_mult', amount: 1.1} },
    'stone_tarshish': { id: 'stone_tarshish', name: 'Tarshish (Asher)', desc: 'Aquamarine stone. PASSIVE: Healing effects +20%.', type: 'key_item', isQuestItem: true, passive: {stat: 'heal_mult', amount: 1.2} },
    
    'hoshen_breastplate': { id: 'hoshen_breastplate', name: 'Hoshen Mishpat', desc: 'The Breastplate of Judgment. Requires all 12 stones.', type: 'artifact', sellValue: 0 },
};
