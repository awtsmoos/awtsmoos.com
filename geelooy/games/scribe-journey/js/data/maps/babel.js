
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
🧱⬜🧱⬜🗼⬜⬜⬜⬜⬜⬜🧱⬜🧱
🧱⬜🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱⬜🧱
🧱⬜🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 20, targetY: 11 },
            'ascent': { type: 'door', emoji: '🚪', targetMap: 'babel_mid', targetX: 7, targetY: 7 },
            'nimrod_statue': { type: 'npc', emoji: '🗼', dialogue: { start: ["(A statue of a mighty hunter. The inscription reads: 'Let us make a name for ourselves.')", "WARNING: Entering this tower will confuse your senses. Up is Down. Right is Left."] } }
        }
    },
    'babel_mid': {
        width: 15,
        baseLayerString: `
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
🌫️🚪⬜🧱⬜⬜⬜🧱⬜⬜⬜🧱⬜🌫️
🌫️⬜⬜🧱⬜⬜⬜🧱⬜⬜⬜🧱⬜🌫️
🌫️⬜🧱🧱🧱⬜🧱🧱🧱⬜🧱🧱🧱⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️🧱🧱🧱⬜🧱🧱🧱⬜🧱🧱🧱⬜🌫️
🌫️⬜⬜🧱⬜⬜⬜🧱⬜⬜⬜🧱⬜🌫️
🌫️🚪⬜🧱⬜⬜⬜🧱⬜⬜⬜🧱⬜🚪🌫️
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
        `,
        encounters: {
            '⬜': [
                { id: 'spark_anger', levelRange: [40, 45], chance: 0.4 },
                { id: 'market_thief', levelRange: [40, 45], chance: 0.4 }
            ]
        },
        interactables: {
            'down': { type: 'door', emoji: '🚪', targetMap: 'babel_base', targetX: 7, targetY: 4 },
            'up': { type: 'door', emoji: '🚪', targetMap: 'babel_top', targetX: 7, targetY: 4 },
            'confused_builder': { type: 'npc', emoji: '🧱', dialogue: { start: ["Brick? No, I said mortar! Stone? No, slime!", "Everything is backwards here!"] } }
        }
    },
    'babel_top': {
        width: 12,
        baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜🌫️⬜🌫️⬜👑⬜🌫️⬜🌫️⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜🌫️⬜🌫️⬜🌫️⬜🌫️⬜🌫️⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
        `,
        interactables: {
            'down': { type: 'door', emoji: '🚪', targetMap: 'babel_mid', targetX: 13, targetY: 7 },
            'confusion_boss': { 
                type: 'npc', emoji: '👑', 
                dialogue: { 
                    start: ["I am the King of Confusion. I mix the languages so no one understands his brother.", {startBattle: [{id: 'hollow_crown', level: 60}]}, {setFlag: 'climbed_babel'}] 
                } 
            }
        }
    }
};
