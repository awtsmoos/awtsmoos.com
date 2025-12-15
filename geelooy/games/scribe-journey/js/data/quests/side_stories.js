
// B"H
// js/data/quests/side_stories.js

export const sideQuests = {
    'side_1_lost_sheep': {
        id: 'side_1_lost_sheep', name: "The Stray Flock",
        desc: "Farmer Dan has lost his sheep in the fields. Return them.",
        status: 'available',
        objectives: [
            { id: 'defeat_wolves', text: 'Defeat 3 Wild Boars threatening the flock.', completed: false, target: {type: 'defeat', musagId: 'wild_boar', count: 3} }
        ],
        rewards: { money: { perutah: 150 } }
    },
    'side_2_ink_shortage': {
        id: 'side_2_ink_shortage', name: "Ink Shortage",
        desc: "The Scribe Atheneum is running low on special ink.",
        status: 'available',
        objectives: [
            { id: 'collect_ink', text: 'Collect 2 Ink of Potential.', completed: false, target: {type: 'collect', itemId: 'ink_of_potential', count: 2} }
        ],
        rewards: { items: ['tome_of_flow'] }
    },
    'side_3_broken_wall': {
        id: 'side_3_broken_wall', name: "The Broken Wall",
        desc: "A wall in the academy has collapsed. Find stones to repair it.",
        status: 'available',
        objectives: [
            { id: 'collect_stones', text: 'Collect 5 Stone Fragments.', completed: false, target: {type: 'collect', itemId: 'stone_fragment', count: 5} }
        ],
        rewards: { money: { perutah: 250 } }
    }
};
