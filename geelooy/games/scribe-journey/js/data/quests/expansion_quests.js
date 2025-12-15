
// B"H
// js/data/quests/expansion_quests.js

export const expansionQuests = {
    'quest_missing_yeast': {
        id: 'quest_missing_yeast', name: "The Missing Yeast",
        desc: "Baker Berel has run out of yeast. Find the wild yeast in the fields.",
        status: 'available',
        objectives: [
            { id: 'find_yeast', text: 'Find Wild Yeast in Malkuth Fields.', completed: false, target: {type: 'collect', itemId: 'wild_yeast', count: 3} }, // Item to be added to drops
            { id: 'return_yeast', text: 'Return to Baker Berel.', completed: false, target: {type: 'dialogue', flag: 'yeast_returned'} }
        ],
        rewards: { items: ['challah_loaf', 'rugelach_pastry'] },
        questGiverId: 'baker_berel'
    },
    'quest_buried_texts': {
        id: 'quest_buried_texts', name: "Buried Texts",
        desc: "The Sofer needs help organizing the Genizah.",
        status: 'available',
        objectives: [
            { id: 'clear_dust', text: 'Defeat 5 Dust Mites in the Genizah.', completed: false, target: {type: 'defeat', musagId: 'dust_mite', count: 5} }
        ],
        rewards: { money: { perutah: 100 }, items: ['feather_bedikah'] },
        questGiverId: 'sofer_stam'
    },
    'quest_good_match': {
        id: 'quest_good_match', name: "A Good Match",
        desc: "Yente needs you to deliver a message to a shy student.",
        status: 'available',
        objectives: [
            { id: 'deliver_note', text: 'Deliver note to Yeshiva Student in 770.', completed: false, target: {type: 'dialogue', flag: 'note_delivered'} }
        ],
        rewards: { money: { perutah: 50 } },
        questGiverId: 'shadchanit_yente'
    },
    'quest_midnight_study': {
        id: 'quest_midnight_study', name: "Midnight Study",
        desc: "Study Torah on the rooftop at midnight.",
        status: 'available',
        objectives: [
            { id: 'study_rooftop', text: 'Go to Scribe Rooftop and Meditate.', completed: false, target: {type: 'dialogue', flag: 'meditated_rooftop'} }
        ],
        rewards: { xp: 500 },
        questGiverId: 'elder_scribe'
    },
    // --- 7 New Quests ---
    'quest_lost_minyan': {
        id: 'quest_lost_minyan', name: "The Lost Minyan",
        desc: "A Minyan is forming in the Market Alley, but they are short one man. Find the 10th.",
        status: 'available',
        objectives: [
            { id: 'find_tenth', text: 'Convince the Cynical Pedestrian to join.', completed: false, target: {type: 'defeat', musagId: 'cynical_pedestrian', count: 1} }, // Defeating him convinces him
            { id: 'start_davening', text: 'Return to the Market Minyan.', completed: false, target: {type: 'dialogue', flag: 'minyan_complete'} }
        ],
        rewards: { xp: 1000, money: { perutah: 180 } }
    },
    'quest_kosher_hunt': {
        id: 'quest_kosher_hunt', name: "Kosher Hunt",
        desc: "The Butcher needs specific ingredients for Shabbos.",
        status: 'available',
        objectives: [
            { id: 'find_fish', text: 'Catch 3 Silent Fish.', completed: false, target: {type: 'defeat', musagId: 'silent_fish', count: 3} },
            { id: 'find_salt', text: 'Collect Salt of Sodom.', completed: false, target: {type: 'collect', itemId: 'salt_of_sodom', count: 1} }
        ],
        rewards: { items: ['gefilte_fish', 'horseradish_jar'] }
    },
    'quest_scribe_ink': {
        id: 'quest_scribe_ink', name: "Scribe's Ink",
        desc: "To write the holy scrolls, special ingredients are needed.",
        status: 'available',
        objectives: [
            { id: 'collect_gallnut', text: 'Collect Gallnuts from Oak Trees (Netzach).', completed: false, target: {type: 'collect', itemId: 'cedar_wood', count: 1} }, // Placeholder item
            { id: 'collect_vitriol', text: 'Collect Vitriol from the Laboratory (Hod).', completed: false, target: {type: 'collect', itemId: 'ink_of_potential', count: 3} }
        ],
        rewards: { items: ['mystic_ink'] }
    },
    'quest_matchmaker_2': {
        id: 'quest_matchmaker_2', name: "Matchmaker II",
        desc: "A harder delivery. The prospective groom is meditating on Mount Sinai.",
        status: 'locked',
        objectives: [
            { id: 'climb_sinai', text: 'Find the student at the base of Sinai.', completed: false, target: {type: 'dialogue', flag: 'sinai_match_delivered'} }
        ],
        rewards: { money: { perutah: 500 } }
    },
    'quest_repair_wall': {
        id: 'quest_repair_wall', name: "Repair the Wall",
        desc: "The walls of Jerusalem (Kotel) need spiritual repair.",
        status: 'available',
        objectives: [
            { id: 'collect_stones', text: 'Collect 10 Stone Fragments from Gevurah.', completed: false, target: {type: 'collect', itemId: 'stone_fragment', count: 10} }
        ],
        rewards: { money: { perutah: 1000 }, xp: 2000 }
    },
    'quest_light_candles': {
        id: 'quest_light_candles', name: "Light the Candles",
        desc: "It is almost Shabbat. You must light the candles in Rachel's Tomb before sunset.",
        status: 'available',
        objectives: [
            { id: 'go_tomb', text: 'Travel to Rachel\'s Tomb.', completed: false },
            { id: 'light', text: 'Light the candles.', completed: false, target: {type: 'dialogue', flag: 'rachel_candles_lit'} }
        ],
        rewards: { items: ['havdalah_candle'] }
    },
    'quest_shamir': {
        id: 'quest_shamir', name: "The Shamir Worm",
        desc: "King Solomon needs the Shamir to build the Temple without iron. Capture it.",
        status: 'locked',
        objectives: [
            { id: 'find_nest', text: 'Locate the Shamir\'s nest in the highest mountains.', completed: false },
            { id: 'capture_worm', text: 'Capture the Shamir Worm (Use Lead Box).', completed: false, target: {type: 'collect', itemId: 'shamir_worm_item', count: 1} }
        ],
        rewards: { items: ['golden_bell', 'ancient_coin'] }
    }
};