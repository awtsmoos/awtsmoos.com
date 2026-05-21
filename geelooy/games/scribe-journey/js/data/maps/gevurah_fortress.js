
// B"H
// js/data/maps/gevurah_fortress.js

export const gevurahMaps = {
    'gevurah_entrance': {
        width: 20,
        baseLayerString: `
🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋
🌋⬜🔥⬜⬜⬜🔥🔥⬜⬜⬜🔥⬜⬜⬜🔥⬜🌋
🌋⬜🪨🪨🪨🪨🪨⬜⬜⬜🪨🪨🪨🪨🪨⬜🌋
🌋⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜🌋
🌋⬜🔥⬜⬜🔥⬜⬜⬜🔥⬜⬜🔥⬜🌋
🌋⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜🌋
🌋⬜🪨🪨🪨🪨🪨⬜⬜⬜🪨🪨🪨🪨🪨⬜🌋
🌋⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌋
🌋⬜🪨🪨🪨🪨🪨⬜⬜⬜🪨🪨🪨🪨🪨⬜🌋
🌋⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜🌋
🌋⬜🔥⬜👹⬜🔥⬜⬜⬜🔥⬜👹⬜🔥⬜🌋
🌋⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜🌋
🌋⬜🪨🪨🪨🪨🪨⬜⬜⬜🪨🪨🪨🪨🪨⬜🌋
🌋⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌋
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
            'to_volcano': { type: 'door', uu: '\ue701', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'gevurah_volcano', targetX: 4, targetY: 4 },
            'to_inner_sanctum': { type: 'door', uu: '\ue702', visual: '🚪', emoji: '🚪', x: 18, y: 1, targetMap: 'gevurah_sanctum', targetX: 1, targetY: 5 },
            'guard_1': { type: 'npc', uu: '\ue705', visual: '👹', emoji: '👹', x: 4, y: 4, dialogue: { start: ["HALT. STATE YOUR PURPOSE. ONLY TRUTH PASSES."] } },
            'guard_2': { type: 'npc', uu: '\ue706', visual: '👹', emoji: '👹', x: 12, y: 4, dialogue: { start: ["LAW IS ABSOLUTE. MERCY IS WEAKNESS."] } },
            'wandering_blade': { type: 'npc', uu: '\ue709', visual: '⚔️', emoji: '⚔️', x: 8, y: 7, dialogue: { start: ["A blade that turns every way... guarding the path to the Tree of Life.", {startBattle: [{id: 'flaming_sword', level: 35}]}] } },
            'to_armory': { type: 'door', uu: '\ue703', visual: '🚪', emoji: '🚪', x: 1, y: 13, targetMap: 'gevurah_armory', targetX: 1, targetY: 4 },
            'to_chesed_road': { type: 'door', uu: '\ue704', visual: '🚪', emoji: '🚪', x: 15, y: 13, targetMap: 'chesed_springs', targetX: 1, targetY: 3 },
            'guard_3': { type: 'npc', uu: '\ue707', visual: '👹', emoji: '👹', x: 4, y: 10, dialogue: { start: ["Discipline without purpose becomes cruelty. Bring purpose, or turn back."] } },
            'guard_4': { type: 'npc', uu: '\ue708', visual: '👹', emoji: '👹', x: 12, y: 10, dialogue: { start: ["The fire below judges action, not intention alone."] } },
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
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        encounters: {
            '⬜': [{ id: 'absolute_zero', levelRange: [30, 35], chance: 0.4 }]
        },
        interactables: {
            'exit': { type: 'door', uu: '\ue711', visual: '🚪', emoji: '🚪', x: 1, y: 6, targetMap: 'gevurah_entrance', targetX: 18, targetY: 13 },
            'judge': { type: 'npc', uu: '\ue712', visual: '⚖️', emoji: '⚖️', x: 6, y: 6, dialogue: { start: ["I am the final line. If you pass me, you reach Tiferet."] } }
        }
    }
};
