
// B"H
// js/data/quests/tribes.js

export const tribeQuests = {
    'tribes_1_stones': { 
        id: 'tribes_1_stones', name: "The Twelve Stones", 
        desc: "Aaron Hakohen needs the 12 stones of the Hoshen to restore the service of the Mishkan.", 
        status: 'available', 
        objectives: [ 
            { id: 'collect_nofech', text: 'Earn Nofech from Prince Nachshon (Judah).', completed: false, target: {type: 'collect', itemId: 'stone_nofech', count: 1} },
            { id: 'collect_sapir', text: 'Earn Sapir from Prince Netanel (Yissachar).', completed: false, target: {type: 'collect', itemId: 'stone_sapir', count: 1} },
            { id: 'collect_yahalom', text: 'Earn Yahalom from Prince Eliav (Zevulun).', completed: false, target: {type: 'collect', itemId: 'stone_yahalom', count: 1} },
            { id: 'collect_leshem', text: 'Earn Leshem from Prince Achiezer (Dan).', completed: false, target: {type: 'collect', itemId: 'stone_leshem', count: 1} },
            { id: 'collect_shvo', text: 'Earn Shvo from Prince Ahira (Naftali).', completed: false, target: {type: 'collect', itemId: 'stone_shvo', count: 1} },
            { id: 'collect_tarshish', text: 'Earn Tarshish from Prince Pagiel (Asher).', completed: false, target: {type: 'collect', itemId: 'stone_tarshish', count: 1} }
        ],
        rewards: { money: { perutah: 5000 }, items: ['hoshen_breastplate'], xp: 10000 },
        questGiverId: 'aaron_priest'
    }
};
