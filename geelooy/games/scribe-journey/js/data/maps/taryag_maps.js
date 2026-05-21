
// B"H
// js/data/maps/taryag_maps.js

export const taryagMaps = {
    'temple_mount_entrance': {
        width: 25,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜🏛️⬜⬜⬜🏛️⬜⬜⬜🏛️⬜⬜⬜🏛️⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜ﰄ⬜⬜⬜🕊️⬜⬜⬜ﰂ⬜⬜⬜🕊️⬜⬜⬜🕊️⬜⬜⬜🕊️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜ﰃ⬜⬜⬜🧖‍♂️⬜⬜⬜🧖‍♂️⬜⬜⬜🧖‍♂️⬜⬜⬜🧖‍♂️⬜⬜⬜🧖‍♂️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱ﰁ🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ufc01', visual: '🚪', emoji: '🚪', x: 12, y: 8, targetMap: 'kotel_plaza', targetX: 10, targetY: 5 },
            'azara_gate': { type: 'door', uu: '\ufc02', visual: '🚪', emoji: '🚪', x: 10, y: 4, targetMap: 'temple_courtyard', targetX: 10, targetY: 10, dialogue: {start: ["Only the pure may enter the Courtyard."]} },
            'levite_choir': { type: 'npc', uu: '\ufc03', visual: '🧖‍♂️', emoji: '🧖‍♂️', x: 2, y: 6, dialogue: {start: ["We guard the mount and sing the songs."]} },
            'money_changer': { type: 'npc', uu: '\ufc04', visual: '🕊️', emoji: '🕊️', x: 2, y: 4, dialogue: {start: ["Half-Shekel for the sacrifices?"]} }
        }
    },
    'temple_courtyard': {
        width: 20,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜🏛️⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🔥⬜⬜⬜⬜⬜⬜ﰔ⬜⬜⬜⬜⬜⬜🔥⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🐑⬜⬜⬜⬜⬜⬛⬛⬛⬜⬜⬜⬜⬜🐑⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬛ﰒ⬛⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🧖‍♂️⬜⬜⬜⬜⬛⬛⬛⬜⬜⬜⬜⬜🧖‍♂️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜ﰓ⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🎷⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🎺⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱ﰑ🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ufc11', visual: '🚪', emoji: '🚪', x: 9, y: 9, targetMap: 'temple_mount_entrance', targetX: 12, targetY: 4 },
            'altar': { type: 'npc', uu: '\ufc12', visual: '🔥', emoji: '🔥', x: 8, y: 5, dialogue: {start: ["The Mizbeach. The fire never goes out.", {choices: [{text: "Offer Korban", action: "craft_korban"}, {text: "Leave", next: "end"}]}]} },
            'ramp': { type: 'npc', uu: '\ufc13', visual: '🎢', emoji: '🎢', x: 8, y: 7, dialogue: {start: ["The ramp to the altar. Walk slowly and with reverence."]} },
            'heichal_door': { type: 'door', uu: '\ufc14', visual: '🚪', emoji: '🚪', x: 9, y: 2, targetMap: 'holy_of_holies_ante', targetX: 5, targetY: 5 }
        }
    },
    'holy_of_holies_ante': {
        width: 10,
        baseLayerString: `
🥇🥇🥇🥇🥇🥇🥇🥇🥇🥇
🥇ﰢ⬜⬜⬜⬜⬜⬜ﰣ🥇
🥇⬜⬜⬜⬜⬜⬜⬜⬜🥇
🥇⬜⬜⬜⬜ﰥ⬜⬜⬜🥇
🥇⬜⬜⬜⬜⬜⬜⬜⬜🥇
🥇ﰤ⬜⬜⬜⬜⬜⬜🔱🥇
🥇🥇🥇🥇ﰡ🥇🥇🥇🥇🥇
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ufc21', visual: '🚪', emoji: '🚪', x: 4, y: 6, targetMap: 'temple_courtyard', targetX: 10, targetY: 2 },
            'menorah': { type: 'npc', uu: '\ufc22', visual: '🕯️', emoji: '🕯️', x: 1, y: 1, dialogue: {start: ["The Golden Menorah."]} },
            'showbread': { type: 'npc', uu: '\ufc23', visual: '🍞', emoji: '🍞', x: 8, y: 1, dialogue: {start: ["The Shulchan with the Showbread."]} },
            'incense_altar': { type: 'npc', uu: '\ufc24', visual: '🔱', emoji: '🔱', x: 1, y: 5, dialogue: {start: ["The Golden Altar for Ketoret."]} },
            'kodesh_kodashim': { type: 'door', uu: '\ufc25', visual: '🚪', emoji: '🚪', x: 5, y: 3, targetMap: 'keter_heights', targetX: 7, targetY: 7, dialogue: {start: ["Only the Kohen Gadol on Yom Kippur may enter here... or one who has ascended to Keter."]} }
        }
    },
    'city_of_refuge': {
        width: 15,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🏠⬜🏠⬜🏠⬜⬜⬜🏠⬜🏠⬜🏠🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🏠⬜ﰲ⬜⬜⬜⛲⬜⬜⬜🧘‍♂️⬜🏠🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🛡️⬜⬜⬜⬜⬜ﰳ⬜⬜⬜⬜⬜🛡️🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱ﰱ🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ufc31', visual: '🚪', emoji: '🚪', x: 7, y: 7, targetMap: 'malkuth_village', targetX: 1, targetY: 10 },
            'refugee': { type: 'npc', uu: '\ufc32', visual: '🏃‍♂️', emoji: '🏃‍♂️', x: 3, y: 3, dialogue: {start: ["I killed a man by accident. Here I am safe from the Blood Avenger."]} },
            'elder': { type: 'npc', uu: '\ufc33', visual: '📜', emoji: '📜', x: 7, y: 5, dialogue: {start: ["This is Ir Miklat. The Torah provides a haven for the mistake maker."]} }
        }
    },
    'sanhedrin_chamber': {
        width: 13,
        baseLayerString: `
🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️
🏛️🧔🧔🧔🧔🧔🧔🧔🧔🧔🧔🧔🏛️
🏛️🧔⬜⬜⬜⬜⬜⬜⬜⬜⬜🧔🏛️
🏛️🧔⬜⬜⬜⬜ﱂ⬜⬜⬜⬜🧔🏛️
🏛️🧔⬜⬜⬜⬜⬜⬜⬜⬜⬜🧔🏛️
🏛️🧔🧔🧔🧔🧔ﱁ🧔🧔🧔🧔🧔🏛️
🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ufc41', visual: '🚪', emoji: '🚪', x: 6, y: 5, targetMap: 'temple_mount_entrance', targetX: 12, targetY: 6 },
            'nasi': { type: 'npc', uu: '\ufc42', visual: '⚖️', emoji: '⚖️', x: 6, y: 3, dialogue: {start: ["The Sanhedrin of 71 sits in a semi-circle. Bring your hard questions here."]} }
        }
    }
};
