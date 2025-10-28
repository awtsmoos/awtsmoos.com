// B"H
// js/data/maps/malkuth.js

export const malkuthMaps = {
    'malkuth_village': {
        // Map is now much larger and more organic
        width: 20,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜🌳📜🌳⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜🏠🏠⬜⬜⬜⬜⬜🌳⬜🌳⬜⬜⬜⬜⬜🌳🌳🌳
🌳⬜⬜⬜⬜🌳🌳🌳🌳🌳⬜🌳🌳🌳👨⬜⬜⬜⬜🌳
🌳🌳🌳⬜🌳🌳⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜⬜⬜🔥⬜⬜⬜⬜⬜⬜⬜🌳🌳🌳⬜🚪⬜🌳
🌳👨‍🌾⬜💧⬜⬜🌿⬜⬜⬜⬜⬜🌳⬜⬜⬜⬜⬜🌳
🌳⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜⬜🐂⬜⬜⬜⬜⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜⬜⬜🌾🌾⬜⬜⬜⬜⬜🛒⬜⬜⬜⬜🌳
🌳⬜⬜⬜🌾🌾⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
        `,
        interactables: {
            'start_sequence': { dialogue: { start: ["The world feels... fractured, Scribe.", "The Great Sefer is shattered. Its concepts now roam wild as Musagim.", "You must journey through the Sefirot. Find the fragments. Rectify Creation.", "Take this satchel. May your ink flow true.", "end"] } },
            '1,2': { type: 'door', emoji: '🏠', targetMap: 'scholar_house', targetX: 4, targetY: 6 },
            '2,2': { type: 'door', emoji: '🏠', targetMap: 'merchant_house', targetX: 3, targetY: 4 },
            '9,1': { type: 'npc', emoji: '📜', id: 'elder_scribe', questGiver: 'main_quest_1', dialogue: { start: ["The path to the upper realms lies through the shimmering door to the east. Be wary, for Yesod's nature is illusion."], completed: ["You have the first fragment! The path forward will be harder, but you have proven your worth."] } },
            '17,6': { type: 'door', emoji: '🚪', targetMap: 'yesod_shore', targetX: 1, targetY: 4 },
            
            // --- Nizkei Mamon (Damages) Quest NPCs ---
            '14,4': { type: 'npc', emoji: '👨', id: 'reuven', questGiver: 'nizkei_mamon_1_goring_ox', dialogue: { 
                start: ["Scribe, thank heavens! My prize ox... gored by Shimon's beast! Shimon claims it was an accident, but I am ruined! Please, find the just path. The sage in the scholar's house might know the ancient laws."], 
                in_progress: ["Please, speak to the Echo of Rambam. I must know what is just."], 
                learned_law: ["You have spoken to the sage? Please, tell us what the Halacha is!", {choices: [
                    {text: "Shimon must pay half the damages, taken from the value of his ox.", next: "mediate_correct"}, 
                    {text: "Shimon must pay for all the damages.", next: "mediate_incorrect"}
                ]}], 
                mediate_correct: ["Half the value... from the ox itself. It is a hard ruling, but it is just. Thank you for bringing clarity.", {finalizeQuest: 'nizkei_mamon_1_goring_ox'}], 
                mediate_incorrect: ["Full damages? Shimon says that is not what the sage taught... I am confused."]
            }},
            // FIX: Shimon is now correctly assigned to the Ox emoji at this location
            '11,8': { type: 'npc', emoji: '🐂', id: 'shimon', dialogue: {
                start: ["Shimon stands beside his ox, looking worried.", {choices:[{text: "(Speak to Shimon)", next: "talk"}]}], 
                talk: ["My ox... it has never gored before. It is a Tam, an innocent one! I cannot afford to pay for Reuven's entire animal. It would ruin me. If only someone knew the true law..."]
            }},
            
            // --- Flavor NPCs ---
            '1,7': { type: 'npc', emoji: '👨‍🌾', id: 'farmer_dan', dialogue: { start: ["Shalom. The world groans, but the earth still gives. Remember your foundation."] } },
            '11,10': { type: 'npc', emoji: '🛒', id: 'trader_levi', dialogue: { start: ["Goods from across the realms! Care for a look?", {choices: [{text: "Buy"}, {text: "Sell"}, {text: "Leave"}]}] } },
        }
    },
    'scholar_house': {
        width: 8,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜📚📚⬜⬜🪨
🪨⬜⬜⬜⬜⬜⬜🪨
🪨⬜👨‍🏫⬜⬜📖⬜🪨
🪨⬜⬜⬜⬜⬜⬜🪨
🪨⬜⬜🕳️⬜⬜⬜🪨
🪨🪨🪨⬜🚪⬜🪨🪨
        `,
        interactables: {
            '4,6': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 1, targetY: 3 }, // Corrected exit coordinates
            '2,3': { type: 'npc', emoji: '👨‍🏫', id: 'rambam_spirit', questGiver: 'rambam_quest_1', dialogue: { 
                start: ["I am but an echo of Moshe ben Maimon... My Mishneh Torah has been shattered. Its pages are lost in the depths below.", "These are not mere words, but the structure of a just reality. If you seek understanding, descend and restore my work.", {giveItem: "cavern_key"}, "Do you have a specific query?", {choices: [{text:"Ask about the Goring Ox.", next: "nizkei_mamon"}, {text: "Ask about Purity.", next: "mikvaot"}, {text: "I must go.", next:"end"}]}], 
                in_progress: ["The foundations of Torah are the foundations of the world. Please, find my pages."], 
                completed: ["You have restored the foundation. Knowledge is the truest Tikkun."],
                nizkei_mamon: ["You ask of damages? The Torah states if an animal is a 'Tam' - not known to be dangerous - the owner pays only half the damages, from the value of the animal itself. This is a fine, a warning.", "Go, and apply this wisdom.", {updateQuest: "nizkei_mamon_1_goring_ox", objectiveId: "learn_law"}, "end"],
                mikvaot: ["Purity is a spiritual state. It can only be achieved by immersing in 'living water' - a Mikveh of 40 Se'ah. Water drawn by a person in a vessel ('Mayim She'uvim') invalidates it. A 'Chatzitzah' (barrier) also invalidates it. Ponder this.", {acceptQuest: "mikvaot_1_pure_waters"}, "end"]
            }},
            '3,5': { type: 'door', emoji: '🕳️', targetMap: 'mishnah_caverns_1', targetX: 4, targetY: 1, condition: { type: 'hasItem', itemId: 'cavern_key' } },
        }
    },
    'merchant_house': {
        width: 7,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨
🪨💰⬜📦⬜💰🪨
🪨⬜⬜⬜⬜⬜🪨
🪨⬜⬜🛒⬜⬜🪨
🪨🪨🪨⬜🚪⬜🪨
        `,
        interactables: {
            '4,4': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 2, targetY: 2 },
            '3,3': { type: 'npc', emoji: '🛒', id: 'merchant_shlomo', dialogue: { start: ["Ah, a Scribe! My wares are concepts made manifest. Perhaps you will find something to aid your journey?", {choices: [
                {text: "Buy Items"}, {text: "Sell Fragments"}, {text: "Inquire about... special stock.", next: "special_stock"}, {text:"Leave"}
            ]}], special_stock: ["Hah! A discerning eye. I sometimes come across... unique concepts. For a price, of course.", {choices: [{text: "Show me."}, {text: "Perhaps later."}]}]}}
        }
    },
};