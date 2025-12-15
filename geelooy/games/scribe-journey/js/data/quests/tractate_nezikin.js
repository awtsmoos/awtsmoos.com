
// B"H
// js/data/quests/tractate_nezikin.js

export const nezikinQuests = {
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
    'nizkei_mamon_3_fire': {
        id: 'nizkei_mamon_3_fire', name: "Law of Damages III: The Spreading Fire",
        desc: "A fire started in Gevurah has spread to a field of thorns. Who is liable?",
        status: 'locked',
        objectives: [
            { id: 'douse_fire', text: 'Defeat 3 Ember Spirits preventing the fire from dying.', completed: false, target: {type: 'defeat', musagId: 'ember_spirit', count: 3} },
            { id: 'find_arsonist', text: 'Find the carelessness that sparked the flame.', completed: false }
        ],
        rewards: { money: { perutah: 600 }, items: ['tome_of_pummel'] }
    }
};
