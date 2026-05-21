
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
🧱⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ue301', visual: '🚪', emoji: '🚪', x: 1, y: 5, targetMap: 'malkuth_village', targetX: 13, targetY: 10 },
            'baker_berel': { type: 'npc', uu: '\ue302', visual: '👨‍🍳', emoji: '👨‍🍳', x: 4, y: 3, shop: true, dialogue: { start: ["Fresh Challah! Rugelach! Get them while they're hot!"] } }
        }
    },
    'mikveh_entrance': {
        width: 10,
        baseLayerString: `
🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
🟦⬜⬜⬜⬜⬜⬜⬜🟦
🟦⬜⬜🧖‍♂️⬜⬜⬜🧖‍♀️⬜🟦
🟦⬜💧⬜⬜⬜⬜💧⬜🟦
🟦⬜⬜⬜⬜⬜⬜⬜⬜🟦
🟦⬜⬜⬜⬜⬜⬜⬜🟦
🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ue311', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'malkuth_village', targetX: 15, targetY: 8 },
            'mikveh_pool': { type: 'npc', uu: '\ue313', visual: '💧', emoji: '💧', x: 2, y: 3, dialogue: { start: ["The waters of purification. (Full Heal + Cleanses Status)", {action: 'meditate_ohel'}] } }
        }
    },
    'synagogue_genizah': {
        width: 8,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱
🧱📚⬜📜⬜📦⬜🧱
🧱⬜⬜⬜⬜⬜⬜🧱
🧱⬜👴⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ue321', visual: '🚪', emoji: '🚪', x: 1, y: 4, targetMap: 'scribe_atheneum_main', targetX: 2, targetY: 2 },
            'sofer_stam': { type: 'npc', uu: '\ue322', visual: '👴', emoji: '👴', x: 2, y: 3, questGiver: 'quest_buried_texts', dialogue: { start: ["These old texts... they contain sparks of holiness.", {acceptQuest: 'quest_buried_texts'}] } }
        }
    },
    'scribe_rooftop': {
        width: 11,
        baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️🔭⬜⬜⬜🕊️⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜🧘⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜☁️
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ue331', visual: '🚪', emoji: '🚪', x: 8, y: 4, targetMap: 'scribe_atheneum_upstairs', targetX: 3, targetY: 1 },
            'meditation_spot': { type: 'npc', uu: '\ue332', visual: '🧘', emoji: '🧘', x: 3, y: 3, dialogue: { start: ["(A quiet place to think.)", {action: 'meditate'}] } }
        }
    },
    'secret_tunnel': {
        width: 20,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
⬜🦇⬜⬜🕸️⬜⬜⬜⬜⬜⬜🕸️⬜⬜🦇⬜
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            'malkuth_side': { type: 'door', uu: '\ue341', visual: '🚪', emoji: '🚪', x: 0, y: 1, targetMap: 'malkuth_village', targetX: 20, targetY: 2 },
            'netzach_side': { type: 'door', uu: '\ue342', visual: '🚪', emoji: '🚪', x: 17, y: 1, targetMap: 'netzach_wilds_entrance', targetX: 2, targetY: 2 }
        }
    },
    'market_stall_interior': {
        width: 8,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱
🧱🏺⬜🔮⬜🧶⬜🧱
🧱⬜⬜⬜⬜⬜⬜🧱
🧱⬜👨‍💼⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ue351', visual: '🚪', emoji: '🚪', x: 1, y: 4, targetMap: 'malkuth_village', targetX: 15, targetY: 10 },
            'trader': { type: 'npc', uu: '\ue352', visual: '👨‍💼', emoji: '👨‍💼', x: 2, y: 3, shop: true, dialogue: { start: ["I have rare items from distant lands."] } }
        }
    },
    'yesod_reflection_pool': {
        width: 10,
        baseLayerString: `
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
🌊⬜💧⬜⬜⬜💧⬜🌊
🌊⬜⬜🪞⬜🪞⬜⬜🌊
🌊⬜⬜⬜🧘⬜⬜⬜🌊
🌊⬜⬜⬜⬜⬜⬜🌊
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ue361', visual: '🚪', emoji: '🚪', x: 1, y: 4, targetMap: 'yesod_shore', targetX: 5, targetY: 2 }
        }
    },
    'netzach_drum_circle': {
        width: 12,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳⬜🥁⬜⬜🥁⬜⬜🥁⬜🌳
🌳⬜⬜⬜💃⬜⬜⬜⬜⬜🌳
🌳⬜⬜⬜⬜⬜⬜💃⬜⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ue371', visual: '🚪', emoji: '🚪', x: 1, y: 4, targetMap: 'netzach_wilds_entrance', targetX: 10, targetY: 5 }
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
            'exit': { type: 'door', uu: '\ue381', visual: '🚪', emoji: '🚪', x: 1, y: 4, targetMap: 'hod_library', targetX: 11, targetY: 8 }
        }
    },
    'gevurah_armory': {
        width: 10,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⚔️⬜🛡️⬜🏹⬜🛡️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜👺⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ue391', visual: '🚪', emoji: '🚪', x: 1, y: 4, targetMap: 'gevurah_entrance', targetX: 5, targetY: 5 }
        }
    }
};
