
// B"H
// js/data/maps/netzach.js

export const netzachMaps = {
    'netzach_wilds_entrance': {
        width: 20,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳🚪⬜🌿🌿🌿⬜⬜⬜🌳🌳⬜🌿⬜⬜⬜⬜⬜🌳
🌳🌳🌳🌿🌳🌳🌳🌳⬜🌳🌳⬜🌿🌳🌳🌳🌳⬜🌳
🌳⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜⬜🌳
🌳⬜🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳⬜🌿⬜⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🌳🌳⬜🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳⬜⬜⬜🌿⬜⬜⬜⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜🌳
🌳⬜🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳⬜🌿⬜⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🌳🌳⬜🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳⬜⬜⬜🌿⬜⬜⬜⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜🌳
🌳⬜🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳⬜🌿⬜⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🚪🌳🌳
        `,
        encounters: {
            '🌿': [
                { id: 'enduring_vine', levelRange: [12, 16], chance: 0.6 },
                { id: 'rhythmic_dancer', levelRange: [14, 18], chance: 0.3 },
                { id: 'blind_zeal', levelRange: [15, 19], chance: 0.1 }
            ]
        },
        interactables: {
            'to_malkuth': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 18, targetY: 5 },
            'to_deep_jungle': { type: 'door', emoji: '🚪', targetMap: 'netzach_deep', targetX: 1, targetY: 1 },
            'wild_guide': { type: 'npc', emoji: '🌿', dialogue: { start: ["This is Netzach - the realm of overcoming obstacles through persistence. The path is not straight, but it endures."] } }
        }
    },
    'netzach_deep': {
        width: 15,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳🛡️⬜🌿🌿🌿🌿🌿🌿🌿🌿🌿⬜🥁🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳🌳
🌳🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿⬜🌿🌳
🌳⬜🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳⬜🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳🏃⬜🌿🌿🌿🌿🌿🌿🌿🌿🌿⬜🚪🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
        `,
        encounters: {
            '🌿': [
                { id: 'blind_zeal', levelRange: [18, 22], chance: 0.5 },
                { id: 'habitual_force', levelRange: [20, 25], chance: 0.5 }
            ]
        },
        interactables: {
            'to_entrance': { type: 'door', emoji: '🚪', targetMap: 'netzach_wilds_entrance', targetX: 1, targetY: 1 },
            'drum_guardian': { type: 'npc', emoji: '🥁', dialogue: { start: ["The beat of the universe never stops.", {startBattle: [{id: 'rhythmic_dancer', level: 25}]}] } },
            'shield_guardian': { type: 'npc', emoji: '🛡️', dialogue: { start: ["I do not move. I do not yield.", {startBattle: [{id: 'stoic_barrier', level: 28}]}] } },
            'runner_guardian': { type: 'npc', emoji: '🏃', dialogue: { start: ["Can you keep up?", {startBattle: [{id: 'habitual_force', level: 24}]}] } },
        }
    }
};
