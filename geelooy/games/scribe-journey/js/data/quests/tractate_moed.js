
// B"H
// js/data/quests/tractate_moed.js

export const moedQuests = {
    'moed_1_shabbat': { 
        id: 'moed_1_shabbat', name: "The Lost Light of Shabbat", 
        desc: "The candles of the village have gone out. You must find the pure oil in the olive groves of Netzach to rekindle them before sunset.", 
        status: 'available', 
        objectives: [ 
            { id: 'find_oil', text: 'Collect 3 Pure Oil flasks from Netzach.', completed: false, target: {type: 'collect', itemId: 'pure_oil', count: 3} },
            { id: 'light_candles', text: 'Return to the Village Elder to light the candles.', completed: false, target: {type: 'dialogue', flag: 'shabbat_restored'} }
        ],
        rewards: { money: { perutah: 300 }, items: ['manna_loaf'] },
        questGiverId: 'elder_scribe'
    },
    'moed_2_pesach': {
        id: 'moed_2_pesach', name: "The Hunter of Chametz",
        desc: "Crumbs of ego (Chametz) are hidden in the deepest caverns. You must find them and nullify them.",
        status: 'locked',
        objectives: [
            { id: 'defeat_yeast', text: 'Defeat 5 Rising Dough golems.', completed: false, target: {type: 'defeat', musagId: 'clay_golem', count: 5} }, // Placeholder mob reuse
            { id: 'find_feather', text: 'Find the Feather of Searching.', completed: false, target: {type: 'acquire', itemId: 'feather_search'} }
        ],
        rewards: { money: { perutah: 500 }, xp: 1000 }
    }
};
