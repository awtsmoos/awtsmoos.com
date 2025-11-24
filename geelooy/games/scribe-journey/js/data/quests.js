// B"H
// js/data/quests.js

export const quests = {
    // --- MAIN STORY ---
    'main_quest_1': { 
        id: 'main_quest_1', name: "The Shattered Sefer", 
        desc: "The Elder Scribe has tasked you with finding the first fragment of the Great Sefer, said to resonate with the foundational energy of Yesod.", 
        status: 'in_progress', 
        objectives: [ { id: 'find_fragment', text: 'Find the Sefer Fragment in the Realm of Yesod', completed: false, target: {type: 'dialogue', flag: 'main_quest_1_complete'} } ],
        rewards: {},
    },

    // --- HILCHOT NIZKEI MAMON (LAWS OF DAMAGES) QUESTLINE ---
    'nizkei_mamon_1_goring_ox': { 
        id: 'nizkei_mamon_1_goring_ox', name: "Law of Damages I: The Goring Ox", 
        desc: "Reuven's ox has been gored by Shimon's. Mediate their dispute by learning the correct law from the Echo of Rambam.", 
        status: 'available', 
        objectives: [ 
            { id: 'learn_law', text: 'Ask the Echo of Rambam about damages from a Tam Ox.', completed: false, target: {type: 'dialogue', flag: 'learned_goring_law'} },
            { id: 'mediate', text: 'Explain the law to Reuven and Shimon.', completed: false, target: {type: 'dialogue', flag: 'mediated_dispute'} }
        ],
        rewards: { money: { perutah: 200 }, items: ['tome_of_harden'] },
    },
    'nizkei_mamon_2_the_pit': { 
        id: 'nizkei_mamon_2_the_pit', name: "Law of Damages II: The Uncovered Pit", 
        desc: "A merchant's ox fell into an uncovered pit in the Mishnah Caverns. You must find the one responsible by understanding the laws of Bor (The Pit).",
        status: 'locked',
        objectives: [
            { id: 'find_pit', text: 'Locate the scene of the accident in the caverns.', completed: false },
            { id: 'learn_pit_law', text: 'Learn the law of The Pit from a lost page of Mishneh Torah.', completed: false, target: {type: 'acquire', itemId: 'rambam_page_damages'} },
            { id: 'confront_digger', text: 'Confront the one who dug the pit.', completed: false },
        ],
        rewards: { money: { perutah: 400 } },
    },

    // --- HILCHOT MIKVAOT (LAWS OF PURITY) QUESTLINE ---
    'mikvaot_1_pure_waters': {
        id: 'mikvaot_1_pure_waters', name: "Waters of Knowledge",
        desc: "The Echo of Rambam speaks of a spiritual impurity clouding the caverns. He says true purity comes from understanding, and directs you to a hidden chamber to learn the laws of Mikvaot.",
        status: 'locked',
        objectives: [
            { id: 'find_chamber', text: 'Find the hidden Chamber of Pure Waters.', completed: false },
            { id: 'defeat_drawn_water', text: 'Overcome the concept of "Drawn Water" that invalidates the source.', completed: false, target: {type: 'defeat', musagId: 'drawn_water_elemental', count: 1}},
            { id: 'learn_mikveh_law', text: 'Find the lost page on Hilchot Mikvaot.', completed: false, target: {type: 'acquire', itemId: 'rambam_page_mikvaot'}},
            { id: 'purify_chamber', text: 'Use the true knowledge to purify the chamber\'s mikveh.', completed: false },
        ],
        rewards: { musagim: [{id: 'benevolent_stream', level: 10}] }
    }
};