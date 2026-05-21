
// B"H
// js/data/maps/babel.js

export const babelMaps = {
    'babel_base': {
        width: 15,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱⬜🧱
🧱⬜🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱⬜🧱
🧱⬜🧱⬜糖⬜⬜⬜⬜⬜⬜🧱⬜🧱
🧱⬜🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱⬜🧱
🧱⬜🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱度⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜拓🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ufa01', visual: '🚪', emoji: '🚪', x: 1, y: 8, targetMap: 'malkuth_village', targetX: 20, targetY: 11 },
            'ascent': { type: 'door', uu: '\ufa02', visual: '🚪', emoji: '🚪', x: 13, y: 8, targetMap: 'babel_mid', targetX: 7, targetY: 7 },
            'nimrod_statue': { type: 'npc', uu: '\ufa03', visual: '🗼', emoji: '🗼', x: 4, y: 4, dialogue: { start: ["(A statue of a mighty hunter. The inscription reads: 'Let us make a name for ourselves.')", "WARNING: Entering this tower will confuse your senses. Up is Down. Right is Left."] } }
        }
    },
    'babel_mid': {
        width: 15,
        baseLayerString: `
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
🌫️﨑⬜🧱⬜⬜⬜🧱⬜⬜⬜🧱⬜🌫️
🌫️⬜⬜🧱⬜⬜⬜🧱⬜⬜⬜🧱⬜🌫️
🌫️⬜🧱🧱🧱⬜🧱🧱🧱⬜🧱🧱🧱⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️🧱🧱🧱⬜🧱🧱🧱⬜🧱🧱🧱⬜🌫️
🌫️⬜⬜🧱⬜⬜⬜🧱⬜⬜⬜🧱⬜🌫️
🌫️晴⬜﨔⬜⬜⬜🧱⬜⬜⬜🧱⬜﨓🌫️
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
        `,
        encounters: {
            '⬜': [
                { id: 'spark_anger', levelRange: [40, 45], chance: 0.4 },
                { id: 'market_thief', levelRange: [40, 45], chance: 0.4 }
            ]
        },
        interactables: {
            'down': { type: 'door', uu: '\ufa11', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'babel_base', targetX: 7, targetY: 4 },
            'up': { type: 'door', uu: '\ufa13', visual: '🚪', emoji: '🚪', x: 13, y: 7, targetMap: 'babel_top', targetX: 7, targetY: 4 },
            'confused_builder': { type: 'npc', uu: '\ufa14', visual: '🧱', emoji: '🧱', x: 3, y: 7, dialogue: { start: ["Brick? No, I said mortar! Stone? No, slime!", "Everything is backwards here!"] } },
            'lower_down': { type: 'door', uu: '\ufa12', visual: '🚪', emoji: '🚪', x: 1, y: 7, targetMap: 'babel_base', targetX: 7, targetY: 4 }
        }
    },
    'babel_top': {
        width: 12,
        baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜🌫️⬜🌫️⬜諸⬜🌫️⬜🌫️⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜🌫️⬜🌫️⬜🌫️⬜🌫️⬜🌫️⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️﨡⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
        `,
        interactables: {
            'down': { type: 'door', uu: '\ufa21', visual: '🚪', emoji: '🚪', x: 1, y: 6, targetMap: 'babel_mid', targetX: 13, targetY: 7 },
            'confusion_boss': { 
                type: 'npc', uu: '\ufa22', visual: '👑', emoji: '👑', x: 6, y: 2, 
                dialogue: { 
                    start: ["I am the King of Confusion. I mix the languages so no one understands his brother.", {startBattle: [{id: 'hollow_crown', level: 60}]}, {setFlag: 'climbed_babel'}] 
                } 
            }
        }
    }
};
