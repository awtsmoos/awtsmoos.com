
// B"H
// js/data/maps/kotel.js

export const kotelMaps = {
    'kotel_plaza': {
        width: 20,
        baseLayerString: `
🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️
🏙️🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱⬜更⬜車⬜賈⬜⬜⬜⬜⬜滑⬜串⬜句⬜🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱龜🟨🟨龜🟨🟨契🟨🟨金🟨🟨喇🟨🟨奈🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱⬜懶⬜⬜⬜⬜⬜癩⬜⬜⬜⬜⬜羅⬜⬜⬜🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱蘿⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️
        `,
        // The Gold wall (🟨) represents the Kotel stones.
        interactables: {
            'exit': { type: 'door', uu: '\uf910', visual: '🚪', emoji: '🚪', x: 2, y: 9, targetMap: 'malkuth_village', targetX: 20, targetY: 20 },
            'kotel_wall_1': { type: 'npc', uu: '\uf907', visual: '🟨', emoji: '🟨', x: 5, y: 5, dialogue: { start: ["(You touch the ancient stones. You feel the Shechinah never left).", {action: 'meditate_ohel'}] } },
            'kotel_wall_2': { type: 'npc', uu: '\uf909', visual: '🟨', emoji: '🟨', x: 10, y: 5, dialogue: { start: ["(Thousands of years of tears and hope. You place a note.)"] } },
            'beggar': { type: 'npc', uu: '\uf901', visual: '🧍‍♂️', emoji: '🧍‍♂️', x: 3, y: 3, dialogue: { start: ["Tzedakah saves from death.", {shop: false, choices: [{text: "Give 18p", action: "give_tzedakah_18"}, {text: "Bless him", next: "bless"}]}], give_tzedakah_18: ["Thank you! You have done a Mitzvah.", {action: 'gemach_deposit', amount: -18}] } },
            'praying_man_west': { type: 'npc', uu: '\uf902', visual: '🧍‍♂️', emoji: '🧍‍♂️', x: 5, y: 3, dialogue: { start: ["He whispers Tehillim for every traveler."] } },
            'praying_man_east': { type: 'npc', uu: '\uf903', visual: '🧍‍♂️', emoji: '🧍‍♂️', x: 7, y: 3, dialogue: { start: ["He asks that every road become safe for shlichus."] } },
            'praying_woman_west': { type: 'npc', uu: '\uf904', visual: '🧍‍♀️', emoji: '🧍‍♀️', x: 13, y: 3, dialogue: { start: ["She places names between the stones."] } },
            'praying_woman_mid': { type: 'npc', uu: '\uf905', visual: '🧍‍♀️', emoji: '🧍‍♀️', x: 15, y: 3, dialogue: { start: ["She reminds you that tears are also action."] } },
            'praying_woman_east': { type: 'npc', uu: '\uf906', visual: '🧍‍♀️', emoji: '🧍‍♀️', x: 17, y: 3, dialogue: { start: ["She waits for the rebuilt house."] } },
            'kotel_wall_3': { type: 'npc', uu: '\uf908', visual: '🟨', emoji: '🟨', x: 5, y: 5, dialogue: { start: ["A stone remembers the desert, the temple, and the return."] } },
            'kotel_wall_4': { type: 'npc', uu: '\uf90a', visual: '🟨', emoji: '🟨', x: 11, y: 5, dialogue: { start: ["A stone asks you to build from the lowest level."] } },
            'kotel_wall_5': { type: 'npc', uu: '\uf90b', visual: '🟨', emoji: '🟨', x: 14, y: 5, dialogue: { start: ["A stone waits for the third Beis Hamikdash."] } },
            'kotel_wall_6': { type: 'npc', uu: '\uf90c', visual: '🟨', emoji: '🟨', x: 17, y: 5, dialogue: { start: ["A stone says: action makes dwelling."] } },
            'bird_west': { type: 'npc', uu: '\uf90d', visual: '🐦', emoji: '🐦', x: 3, y: 7, dialogue: { start: ["A bird carries a note upward."] } },
            'dove_center': { type: 'npc', uu: '\uf90e', visual: '🕊️', emoji: '🕊️', x: 9, y: 7, dialogue: { start: ["A dove waits for peace that descends into streets."] } },
            'bird_east': { type: 'npc', uu: '\uf90f', visual: '🐦', emoji: '🐦', x: 15, y: 7, dialogue: { start: ["A bird returns to the wall again."] } }
        }
    }
};
