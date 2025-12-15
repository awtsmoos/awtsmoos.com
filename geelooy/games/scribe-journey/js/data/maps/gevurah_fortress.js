
// B"H
// js/data/maps/gevurah_fortress.js

export const gevurahMaps = {
    'gevurah_entrance': {
        width: 20,
        baseLayerString: `
🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋
🌋🚪⬜🔥⬜⬜⬜🔥🔥⬜⬜⬜🔥⬜⬜⬜🔥⬜🚪🌋
🌋⬜🪨🪨🪨🪨🪨⬜⬜⬜🪨🪨🪨🪨🪨⬜🌋
🌋⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜🌋
🌋⬜🔥⬜👹⬜🔥⬜⬜⬜🔥⬜👹⬜🔥⬜🌋
🌋⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜🌋
🌋⬜🪨🪨🪨🪨🪨⬜⬜⬜🪨🪨🪨🪨🪨⬜🌋
🌋⬜⬜⬜⬜⬜⬜⬜⚔️⬜⬜⬜⬜⬜⬜⬜🌋
🌋⬜🪨🪨🪨🪨🪨⬜⬜⬜🪨🪨🪨🪨🪨⬜🌋
🌋⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜🌋
🌋⬜🔥⬜👹⬜🔥⬜⬜⬜🔥⬜👹⬜🔥⬜🌋
🌋⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜🌋
🌋⬜🪨🪨🪨🪨🪨⬜⬜⬜🪨🪨🪨🪨🪨⬜🌋
🌋🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🌋
🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋
        `,
        encounters: {
            '🔥': [
                { id: 'ember_spirit', levelRange: [20, 25], chance: 0.4 },
                { id: 'flaming_sword', levelRange: [22, 28], chance: 0.3 }
            ],
            '⬜': [
                { id: 'obsidian_golem', levelRange: [25, 30], chance: 0.2 },
                { id: 'strict_liner', levelRange: [24, 29], chance: 0.2 }
            ]
        },
        interactables: {
            'to_volcano': { type: 'door', emoji: '🚪', targetMap: 'gevurah_volcano', targetX: 4, targetY: 4 },
            'to_inner_sanctum': { type: 'door', emoji: '🚪', targetMap: 'gevurah_sanctum', targetX: 1, targetY: 5 },
            'guard_1': { type: 'npc', emoji: '👹', dialogue: { start: ["HALT. STATE YOUR PURPOSE. ONLY TRUTH PASSES."] } },
            'guard_2': { type: 'npc', emoji: '👹', dialogue: { start: ["LAW IS ABSOLUTE. MERCY IS WEAKNESS."] } },
            'wandering_blade': { type: 'npc', emoji: '⚔️', dialogue: { start: ["A blade that turns every way... guarding the path to the Tree of Life.", {startBattle: [{id: 'flaming_sword', level: 35}]}] } },
        }
    },
    'gevurah_sanctum': {
        width: 15,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜📏⬜⬜⬜❄️⬜⬜⬜📏⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥⬜🧱
🧱🚪⬜⬜⬜⬜⚖️⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        encounters: {
            '⬜': [{ id: 'absolute_zero', levelRange: [30, 35], chance: 0.4 }]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'gevurah_entrance', targetX: 18, targetY: 13 },
            'judge': { type: 'npc', emoji: '⚖️', dialogue: { start: ["I am the final line. If you pass me, you reach Tiferet."] } }
        }
    }
};
