// B"H
// js/data/maps/malkuth.js

export const malkuthMaps = {
    'malkuth_village': {
        width: 20,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜⬜📜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜🏠⬜🏠⬜⬜⬜⬜🌳⬜🌳⬜⬜⬜⬜⬜🌳🌳🌳
🌳⬜⬜⬜⬜⬜🌳🌳🌳🌳⬜🌳🌳🌳👨⬜⬜⬜⬜🌳
🌳🌳🌳⬜🌳🌳⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜⬜⬜🔥⬜⬜⬜⬜⬜⬜⬜🌳🌳🌳⬜🚪⬜🌳
🌳👨‍🌾⬜💧⬜⬜🌿⬜⬜⬜⬜⬜🌳⬜⬜⬜⬜⬜🌳
🌳⬜⬜⬜⬜⬜🌿⬜⬜⬜👨🐂⬜⬜⬜⬜⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜⬜⬜🌾🌾⬜⬜⬜⬜⬜🛒⬜⬜⬜⬜🌳
🌳⬜⬜⬜🌾🌾⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
        `,
        interactables: {
            // By giving interactables an emoji property, the new parser will auto-place them.
            'elder_scribe': { type: 'npc', emoji: '📜', questGiver: 'main_quest_1', dialogue: { start: ["The path to the upper realms lies through the shimmering door to the east. Be wary, for Yesod's nature is illusion."], completed: ["You have the first fragment! The path forward will be harder, but you have proven your worth."] } },
            'house_1': { type: 'door', emoji: '🏠', targetMap: 'scribe_atheneum_main', targetX: 5, targetY: 6 },
            'house_2': { type: 'door', emoji: '🏠', targetMap: 'merchant_house', targetX: 3, targetY: 3 },
            'yesod_door': { type: 'door', emoji: '🚪', targetMap: 'yesod_shore', targetX: 1, targetY: 4 },
            
            'reuven': { type: 'npc', emoji: '👨', questGiver: 'nizkei_mamon_1_goring_ox', dialogue: { 
                start: ["Scribe, thank heavens! My prize ox... gored by Shimon's beast! Shimon claims it was an accident, but I am ruined! Please, find the just path. The sage in the scholar's house might know the ancient laws."], 
                in_progress: ["Please, speak to the Echo of Rambam. I must know what is just."], 
                learned_law: ["You have spoken to the sage? Please, tell us what the Halacha is!", {choices: [
                    {text: "Shimon must pay half the damages, taken from the value of his ox.", next: "mediate_correct"}, 
                    {text: "Shimon must pay for all the damages.", next: "mediate_incorrect"}
                ]}], 
                mediate_correct: ["Half the value... from the ox itself. It is a hard ruling, but it is just. Thank you for bringing clarity.", {finalizeQuest: 'nizkei_mamon_1_goring_ox'}], 
                mediate_incorrect: ["Full damages? Shimon says that is not what the sage taught... I am confused."]
            }},
            
            'shimon': { type: 'npc', emoji: '👨', dialogue: {
                start: ["Shimon stands beside his ox, looking worried.", {choices:[{text: "(Speak to Shimon)", next: "talk"}]}], 
                talk: ["My ox... it has never gored before. It is a Tam, an innocent one! I cannot afford to pay for Reuven's entire animal. It would ruin me. If only someone knew the true law..."]
            }},
            
            'farmer_dan': { type: 'npc', emoji: '👨‍🌾', dialogue: { start: ["Shalom. The world groans, but the earth still gives. Remember your foundation."] } },
            'trader_levi': { type: 'npc', emoji: '🛒', shop: true, dialogue: { start: ["Goods from across the realms! Care for a look?"] } },
        }
    },
    'scribe_atheneum_main': {
        width: 11,
        baseLayerString: `
🪨🪨🪨🪨🪨🚪🪨🪨🪨🪨🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜📖⬜⬜🏆⬜⬜📖⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨🚪⬜⬜⬜👨‍🏫⬜⬜⬜⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨🪨🪨🪨🚪🪨🪨🪨🪨🪨
        `,
        interactables: {
            'upstairs_door': {type: 'door', emoji: '🚪', targetMap: 'scribe_atheneum_upstairs', targetX: 1, targetY: 4},
            'exit_door': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 1, targetY: 3 },
            'caverns_door': { type: 'door', emoji: '🚪', targetMap: 'mishnah_caverns_1', targetX: 4, targetY: 1, condition: { type: 'hasItem', itemId: 'cavern_key' } },
            'rambam_spirit': { type: 'npc', emoji: '👨‍🏫', questGiver: 'rambam_quest_1', dialogue: { 
                start: ["I am but an echo of Moshe ben Maimon. My Mishneh Torah has been shattered. The very structure of a just reality is lost in the depths below.", "These are not mere words. Find my pages. Each one you restore will bring clarity not only to your mind, but to the world itself.", {acceptQuest: 'rambam_quest_1'}, {giveItem: "cavern_key"}, "Do you have a specific query?", {choices: [{text:"Ask about the Goring Ox.", next: "nizkei_mamon"}, {text: "Ask about Purity.", next: "mikvaot"}, {text: "I must go.", next:"end"}]}], 
                in_progress: ["The foundations of Torah are the foundations of the world. Please, find my pages."], 
                completed: ["You have restored the foundation. Knowledge is the truest Tikkun."],
                nizkei_mamon: ["You ask of damages? The Torah states if an animal is a 'Tam' - not known to be dangerous - the owner pays only half the damages, from the value of the animal itself. This is a fine, a warning.", "Go, and apply this wisdom.", {updateQuest: "nizkei_mamon_1_goring_ox", objectiveId: "learn_law"}, "end"],
                mikvaot: ["Purity is a spiritual state, achieved by immersing in 'living water' - a Mikveh of 40 Se'ah. Water drawn by a person in a vessel ('Mayim She'uvim') invalidates it. A 'Chatzitzah' (barrier) also invalidates it. Ponder this.", {acceptQuest: "mikvaot_1_pure_waters"}, "end"]
            }},
            'book_damages': {type: 'npc', emoji: '📖', dialogue: {start: ["(This lectern holds collected pages on Hilchot Nizkei Mamon).", {flagRequired: 'found_page_damages', text: "<b>The Goring Ox:</b> An ox not known for goring is a 'Tam'. If it gores, the owner pays half damages from the ox's value. This is a fine to encourage watchfulness.", next: 'end'}, "The lectern is empty.", "end"]}},
            'book_purity': {type: 'npc', emoji: '📖', dialogue: {start: ["(This lectern holds collected pages on Hilchot Taharah).", {flagRequired: 'found_page_mikvaot', text: "<b>The Mikveh:</b> Purity is restored in a gathering of 40 Se'ah of natural water. Drawn water invalidates it, as it is disconnected from the source.", next: 'end'}, "The lectern is empty.", "end"]}},
            'pedestal': {type: 'npc', emoji: '🏆', dialogue: {start: ["(A pedestal for a great treasure)."]}}
        }
    },
    'scribe_atheneum_upstairs': {
        width: 7,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜🪟⬜⬜🪨
🪨⬜⬜⬜⬜⬜🪨
🪨⬜📜⬜⬜⬜🪨
🪨🚪⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            'downstairs_door': {type: 'door', emoji: '🚪', targetMap: 'scribe_atheneum_main', targetX: 5, targetY: 1},
            'private_desk': {type: 'npc', emoji: '📜', dialogue: {start: ["(Your private desk. A quiet place to study the pages you've collected)."]}}
        }
    },
    'merchant_house': {
        width: 7,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨
🪨💰⬜📦⬜💰🪨
🪨⬜⬜⬜⬜⬜🪨
🪨⬜🛒⬜⬜⬜🪨
🪨🪨🪨🚪🪨🪨🪨
        `,
        interactables: {
            'exit_door': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 3, targetY: 3 },
            'merchant_shlomo': { type: 'npc', emoji: '🛒', shop: true, dialogue: { start: ["Ah, a Scribe! My wares are concepts made manifest..."]}}
        }
    },
};
