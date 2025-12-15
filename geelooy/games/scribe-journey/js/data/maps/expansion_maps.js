
// B"H
// js/data/maps/expansion_maps.js

export const expansionMaps = {
    'bakery_interior': {
        width: 10,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🍞⬜🥖⬜🥯⬜🥨⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🧂⬜👨‍🍳⬜🍯⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🚪⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 13, targetY: 10 },
            'baker_berel': { type: 'npc', emoji: '👨‍🍳', shop: true, dialogue: { start: ["Fresh Challah! Rugelach! Get them while they're hot!"] } }
        }
    },
    'mikveh_entrance': {
        width: 10,
        baseLayerString: `
🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
🟦🚪⬜⬜⬜⬜⬜⬜⬜🟦
🟦⬜⬜🧖‍♂️⬜⬜⬜🧖‍♀️⬜🟦
🟦⬜💧⬜⬜⬜⬜💧⬜🟦
🟦⬜⬜⬜⬜⬜⬜⬜⬜🟦
🟦🚪⬜⬜⬜⬜⬜⬜⬜🟦
🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 15, targetY: 8 },
            'mikveh_pool': { type: 'npc', emoji: '💧', dialogue: { start: ["The waters of purification. (Full Heal + Cleanses Status)", {action: 'meditate_ohel'}] } }
        }
    },
    'synagogue_genizah': {
        width: 8,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱
🧱📚⬜📜⬜📦⬜🧱
🧱⬜⬜⬜⬜⬜⬜🧱
🧱⬜👴⬜⬜⬜⬜🧱
🧱🚪⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'scribe_atheneum_main', targetX: 2, targetY: 2 },
            'sofer_stam': { type: 'npc', emoji: '👴', questGiver: 'quest_buried_texts', dialogue: { start: ["These old texts... they contain sparks of holiness.", {acceptQuest: 'quest_buried_texts'}] } }
        }
    },
    'scribe_rooftop': {
        width: 11,
        baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️🔭⬜⬜⬜🕊️⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜🧘⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜🚪☁️
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'scribe_atheneum_upstairs', targetX: 3, targetY: 1 },
            'meditation_spot': { type: 'npc', emoji: '🧘', dialogue: { start: ["(A quiet place to think.)", {action: 'meditate'}] } }
        }
    },
    'secret_tunnel': {
        width: 20,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🚪⬜🦇⬜⬜🕸️⬜⬜⬜⬜⬜⬜🕸️⬜⬜🦇⬜🚪
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            'malkuth_side': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 20, targetY: 2 },
            'netzach_side': { type: 'door', emoji: '🚪', targetMap: 'netzach_wilds_entrance', targetX: 2, targetY: 2 }
        }
    },
    'market_stall_interior': {
        width: 8,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱
🧱🏺⬜🔮⬜🧶⬜🧱
🧱⬜⬜⬜⬜⬜⬜🧱
🧱⬜👨‍💼⬜⬜⬜⬜🧱
🧱🚪⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 15, targetY: 10 },
            'trader': { type: 'npc', emoji: '👨‍💼', shop: true, dialogue: { start: ["I have rare items from distant lands."] } }
        }
    },
    'yesod_reflection_pool': {
        width: 10,
        baseLayerString: `
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
🌊⬜💧⬜⬜⬜💧⬜🌊
🌊⬜⬜🪞⬜🪞⬜⬜🌊
🌊⬜⬜⬜🧘⬜⬜⬜🌊
🌊🚪⬜⬜⬜⬜⬜⬜🌊
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'yesod_shore', targetX: 5, targetY: 2 }
        }
    },
    'netzach_drum_circle': {
        width: 12,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳⬜🥁⬜⬜🥁⬜⬜🥁⬜🌳
🌳⬜⬜⬜💃⬜⬜⬜⬜⬜🌳
🌳⬜⬜⬜⬜⬜⬜💃⬜⬜🌳
🌳🚪⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'netzach_wilds_entrance', targetX: 10, targetY: 5 }
        }
    },
    'hod_clocktower': {
        width: 8,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱
🧱⚙️⬜🕰️⬜⚙️⬜🧱
🧱⬜⬜⬜⬜⬜⬜🧱
🧱⬜🤖⬜⬜⬜⬜🧱
🧱🚪⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'hod_academy_main', targetX: 5, targetY: 5 }
        }
    },
    'gevurah_armory': {
        width: 10,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⚔️⬜🛡️⬜🏹⬜🛡️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜👺⬜⬜⬜⬜⬜⬜🧱
🧱🚪⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'gevurah_fortress', targetX: 5, targetY: 5 }
        }
    }
};
