// B"H
// js/data/maps/malkuth.js

// Using string templates for map layouts. They will be parsed into arrays.
// Legend: 🌳=Tree, 🏠=House, 📜=Scribe, 👨=NPC, 🌾=Grass, ⬜=Path, 🚪=Door, etc.

export const malkuthMaps = {
    'malkuth_village': {
        width: 15,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳🏠🏠⬜⬜⬜📜⬜⬜⬜⬜⬜⬜🌳🌳
🌳⬜⬜⬜🌳🌳⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳👨🌳🌳🌳🔥🌳🌳⬜⬜⬜⬜⬜⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜🌳⬜⬜⬜⬜⬜🌳
🌳👨‍🌾⬜💧⬜🌿⬜⬜🌳⬜⬜⬜🚪🌳🌳
🌳⬜⬜⬜⬜🌿⬜⬜🌳⬜⬜⬜⬜⬜🌳
🌳🐂🌳🌳🌳🌳🌳🌳🐂⬜⬜⬜⬜🌳
🌳⬜⬜🌾🌾⬜⬜⬜⬜🛒⬜⬜⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
        `,
        interactables: {
            'start_sequence': { dialogue: { start: ["The world feels... fractured, Scribe.", "The Great Sefer is shattered. Its concepts now roam wild as Musagim.", "You must journey through the Sefirot. Find the fragments. Rectify Creation.", "Take this satchel. May your ink flow true.", "end"] } },
            '1,1': { type: 'door', emoji: '🏠', targetMap: 'scholar_house', targetX: 4, targetY: 6 },
            '2,1': { type: 'door', emoji: '🏠', targetMap: 'merchant_house', targetX: 4, targetY: 6 },
            '6,1': { type: 'npc', emoji: '📜', id: 'elder_scribe', questGiver: 'main_quest_1', dialogue: { start: ["The path to Yesod lies through the shimmering door to the east. Be wary, its nature is illusion."], completed: ["You have the first fragment! The path forward will be harder, but you have proven your worth."] } },
            '11,5': { type: 'door', emoji: '🚪', targetMap: 'yesod_shore', targetX: 1, targetY: 4 },
            '1,3': { type: 'npc', emoji: '👨', id: 'reuven', questGiver: 'nizkei_mamon_1_goring_ox', dialogue: { start: ["Scribe, thank heavens! My prize ox... gored by Shimon's beast! Shimon claims it's an accident, but I am ruined! Please, can you find the just path? The sage in the old house might know the ancient laws."], in_progress: ["Please, speak to the Echo of Rambam. I must know what is just."], learned_law: ["You have spoken to the sage? Please, tell us what the Halacha is!", {choices: [{text: "Shimon must pay half the damages from the value of his ox.", next: "mediate_correct"}, {text: "Shimon must pay for all the damages.", next: "mediate_incorrect"}]}], mediate_correct: ["Half the value... from the ox itself. It is a hard ruling, but it is just. Thank you for bringing clarity.", {finalizeQuest: 'nizkei_mamon_1_goring_ox'}], mediate_incorrect: ["Full damages? Shimon says that is not what the sage taught... I am confused."]}},
            '8,7': { type: 'npc', emoji: '🐂', id: 'shimon', dialogue: {start: ["Shimon stands here, looking worried.", {choices:[{text: "(Speak to Shimon)", next: "talk"}]}], talk: ["My ox... it has never gored before. It is a Tam, an innocent one! I cannot afford to pay for Reuven's entire animal. It would ruin me. If only someone knew the true law..."]}},
            '1,5': { type: 'npc', emoji: '👨‍🌾', id: 'farmer_dan', dialogue: { start: ["Shalom. The world groans, but the earth still gives. Remember your foundation."] } },
            '9,8': { type: 'npc', emoji: '🛒', id: 'trader_levi', dialogue: { start: ["Goods from across the realms! Care for a look?", {choices: [{text: "Buy"}, {text: "Sell"}, {text: "Leave"}]}] } },
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
            '4,6': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 1, targetY: 2 },
            '2,3': { type: 'npc', emoji: '👨‍🏫', id: 'rambam_spirit', questGiver: 'rambam_quest_1', dialogue: { 
                start: ["I am but an echo of Moshe ben Maimon. My Mishneh Torah, my 'Code of Law,' has been shattered like the world itself. Its pages are lost in the depths below.", "These are not mere words, but the very structure of a just and holy reality. If you seek understanding, descend into the caverns and restore my work. Each page you find will clarify a law of creation.", {giveItem: "cavern_key"}, "Do you have a specific query for me?", {choices: [{text:"Ask about the Goring Ox.", next: "nizkei_mamon"}, {text: "Ask about Purity.", next: "mikvaot"}, {text: "I must go.", next:"end"}]}], 
                in_progress: ["The foundations of Torah are the foundations of the world. Please, find my pages."], 
                completed: ["You have done it! You have restored the foundation. Knowledge is the truest Tikkun."],
                nizkei_mamon: ["You ask of damages? The Torah states in Exodus 21:35, 'When a person’s ox will gore an ox...'", "If the animal is a 'Tam' - one not known to be prone to this act - the owner pays only half the damages, and only from the value of the animal itself. This is a fine, a warning.", "Go now, and apply this wisdom.", {updateQuest: "nizkei_mamon_1_goring_ox", objectiveId: "learn_law"}, "end"],
                mikvaot: ["You ask of purity? A profound matter. Impurity is not filth to be washed away, but a spiritual state. It can only be removed by immersing in 'living water' - a Mikveh.", "A valid Mikveh must contain 40 Se'ah of natural water. Water drawn by a person in a vessel ('Mayim She'uvim') invalidates it.", "A substance that intervenes ('Chatzitzah') between the body and the water also invalidates the immersion. Ponder this. Perhaps you will encounter these concepts in the caverns below.", {acceptQuest: "mikvaot_1_pure_waters"}, "end"]
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