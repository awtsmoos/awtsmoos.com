
// B"H
// js/data/quests/main_story.js

export const mainStoryQuests = {
    'main_quest_1': { 
        id: 'main_quest_1', name: "The Shattered Sefer", 
        desc: "The Elder Scribe has tasked you with finding the first fragment of the Great Sefer, said to resonate with the foundational energy of Yesod.", 
        status: 'in_progress', 
        objectives: [ { id: 'find_fragment', text: 'Find the Sefer Fragment in the Realm of Yesod', completed: false, target: {type: 'dialogue', flag: 'main_quest_1_complete'} } ],
        rewards: {},
    },
    'main_quest_2': {
        id: 'main_quest_2', name: "Balance of Beauty",
        desc: "To restore Tiferet, you must unite the fire of Gevurah and the water of Chesed.",
        status: 'locked',
        objectives: [
            { id: 'enter_gevurah', text: 'Enter the Fortress of Gevurah.', completed: false },
            { id: 'collect_embers', text: 'Collect 5 Living Embers from Gevurah beasts.', completed: false, target: {type: 'collect', itemId: 'living_ember', count: 5} },
            { id: 'enter_chesed', text: 'Enter the Ocean of Chesed.', completed: false },
            { id: 'collect_droplets', text: 'Collect 5 Mercy Droplets from Chesed beasts.', completed: false, target: {type: 'collect', itemId: 'mercy_droplet', count: 5} },
            { id: 'fuse_tiferet', text: 'Bring them to the King in Tiferet.', completed: false, target: {type: 'dialogue', flag: 'main_quest_2_complete'} }
        ],
        rewards: { money: { perutah: 1000 }, items: ['dust_of_tiferet'] }
    }
};
