
// B"H
// js/data/quests/holiday_quests.js

export const holidayQuests = {
    'chanukah_1_rebellion': {
        id: 'chanukah_1_rebellion', name: "The Few Against The Many",
        desc: "The Greeks have defiled the Citadel. Matityahu hides in the caves. Join the resistance.",
        status: 'available',
        objectives: [
            { id: 'find_caves', text: 'Find the Maccabee Caves.', completed: false },
            { id: 'defeat_guards', text: 'Defeat 3 Hellenist Guards.', completed: false, target: {type: 'defeat', musagId: 'hellenist_guard', count: 3} }
        ],
        rewards: { money: { perutah: 400 }, items: ['sufganiyah'] }
    },
    'chanukah_2_lights': {
        id: 'chanukah_2_lights', name: "Light in Darkness",
        desc: "The Menorah must be lit. Find the single jug of pure oil.",
        status: 'locked',
        objectives: [
            { id: 'learn_pirsumei', text: 'Learn "Pirsumei Nisa" from the Ancient Scroll.', completed: false, target: {type: 'dialogue', flag: 'learned_pirsumei_nisa'} },
            { id: 'find_oil', text: 'Retrieve the Pure Oil Jug from the Citadel Vault.', completed: false, target: {type: 'collect', itemId: 'jug_of_pure_oil', count: 1} },
            { id: 'light_menorah', text: 'Light the Menorah in the Citadel Courtyard.', completed: false, target: {type: 'dialogue', flag: 'menorah_lit'} }
        ],
        rewards: { money: { perutah: 1000 }, items: ['maccabee_shield'] }
    }
};
