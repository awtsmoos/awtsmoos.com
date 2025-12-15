
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
🧱⬜🕊️⬜⬜⬜🕊️⬜⬜⬜🚪⬜⬜⬜🕊️⬜⬜⬜🕊️⬜⬜⬜🕊️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🧖‍♂️⬜⬜⬜🧖‍♂️⬜⬜⬜🧖‍♂️⬜⬜⬜🧖‍♂️⬜⬜⬜🧖‍♂️⬜⬜⬜🧖‍♂️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🚪🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'kotel_plaza', targetX: 10, targetY: 5 },
            'azara_gate': { type: 'door', emoji: '🚪', targetMap: 'temple_courtyard', targetX: 10, targetY: 10, dialogue: {start: ["Only the pure may enter the Courtyard."]} },
            'levite_choir': { type: 'npc', emoji: '🧖‍♂️', dialogue: {start: ["We guard the mount and sing the songs."]} },
            'money_changer': { type: 'npc', emoji: '🕊️', dialogue: {start: ["Half-Shekel for the sacrifices?"]} }
        }
    },
    'temple_courtyard': {
        width: 20,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜🏛️⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🔥⬜⬜⬜⬜⬜⬜🚪⬜⬜⬜⬜⬜⬜🔥⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🐑⬜⬜⬜⬜⬜⬛⬛⬛⬜⬜⬜⬜⬜🐑⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬛🔥⬛⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🧖‍♂️⬜⬜⬜⬜⬛⬛⬛⬜⬜⬜⬜⬜🧖‍♂️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜🎢⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🎷⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🎺⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🚪🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'temple_mount_entrance', targetX: 12, targetY: 4 },
            'altar': { type: 'npc', emoji: '🔥', dialogue: {start: ["The Mizbeach. The fire never goes out.", {choices: [{text: "Offer Korban", action: "craft_korban"}, {text: "Leave", next: "end"}]}]} },
            'ramp': { type: 'npc', emoji: '🎢', dialogue: {start: ["The ramp to the altar. Walk slowly and with reverence."]} },
            'heichal_door': { type: 'door', emoji: '🚪', targetMap: 'holy_of_holies_ante', targetX: 5, targetY: 5 }
        }
    },
    'holy_of_holies_ante': {
        width: 10,
        baseLayerString: `
🥇🥇🥇🥇🥇🥇🥇🥇🥇🥇
🥇🕯️⬜⬜⬜⬜⬜⬜🍞🥇
🥇⬜⬜⬜⬜⬜⬜⬜⬜🥇
🥇⬜⬜⬜⬜🚪⬜⬜⬜🥇
🥇⬜⬜⬜⬜⬜⬜⬜⬜🥇
🥇🔱⬜⬜⬜⬜⬜⬜🔱🥇
🥇🥇🥇🥇🚪🥇🥇🥇🥇🥇
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'temple_courtyard', targetX: 10, targetY: 2 },
            'menorah': { type: 'npc', emoji: '🕯️', dialogue: {start: ["The Golden Menorah."]} },
            'showbread': { type: 'npc', emoji: '🍞', dialogue: {start: ["The Shulchan with the Showbread."]} },
            'incense_altar': { type: 'npc', emoji: '🔱', dialogue: {start: ["The Golden Altar for Ketoret."]} },
            'kodesh_kodashim': { type: 'door', emoji: '🚪', targetMap: 'keter_heights', targetX: 7, targetY: 7, dialogue: {start: ["Only the Kohen Gadol on Yom Kippur may enter here... or one who has ascended to Keter."]} }
        }
    },
    'city_of_refuge': {
        width: 15,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🏠⬜🏠⬜🏠⬜⬜⬜🏠⬜🏠⬜🏠🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🏠⬜🏃‍♂️⬜⬜⬜⛲⬜⬜⬜🧘‍♂️⬜🏠🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🛡️⬜⬜⬜⬜⬜📜⬜⬜⬜⬜⬜🛡️🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🚪🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 1, targetY: 10 },
            'refugee': { type: 'npc', emoji: '🏃‍♂️', dialogue: {start: ["I killed a man by accident. Here I am safe from the Blood Avenger."]} },
            'elder': { type: 'npc', emoji: '📜', dialogue: {start: ["This is Ir Miklat. The Torah provides a haven for the mistake maker."]} }
        }
    },
    'sanhedrin_chamber': {
        width: 13,
        baseLayerString: `
🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️
🏛️🧔🧔🧔🧔🧔🧔🧔🧔🧔🧔🧔🏛️
🏛️🧔⬜⬜⬜⬜⬜⬜⬜⬜⬜🧔🏛️
🏛️🧔⬜⬜⬜⬜⚖️⬜⬜⬜⬜🧔🏛️
🏛️🧔⬜⬜⬜⬜⬜⬜⬜⬜⬜🧔🏛️
🏛️🧔🧔🧔🧔🧔🚪🧔🧔🧔🧔🧔🏛️
🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️🏛️
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'temple_mount_entrance', targetX: 12, targetY: 6 },
            'nasi': { type: 'npc', emoji: '⚖️', dialogue: {start: ["The Sanhedrin of 71 sits in a semi-circle. Bring your hard questions here."]} }
        }
    }
};
