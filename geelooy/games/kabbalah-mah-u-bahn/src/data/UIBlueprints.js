
import { StateRegister } from '../binah/StateRegister.js';

/**
 * B"H
 * Holds the geometry limits defining Malkhut interface constraints completely algorithm-free.
 * Created via His Word constantly resonating into physical shape.
 */
export const UIBlueprints = {
    BattleShapes: [
        { t: 'oval', x: 230, y: 120, rx: 70, ry: 20, c: '#c3e2af' }, // Foe pedestal
        { t: 'oval', x: 80, y: 250, rx: 90, ry: 25, c: '#a2d681' },  // Ally pedestal
        { t: 'rect', x: 10, y: 10, w: 140, h: 40, c: '#ffffdd' },    // Foe Stats Frame
        { t: 'rect', x: 170, y: 190, w: 140, h: 50, c: '#ffffdd' },  // Ally Stats Frame
        { t: 'rect', x: 0, y: 240, w: 320, h: 80, c: '#ffffff' }     // Master Menu Bar
    ],
    BattleTextMap: {
        'MAIN_MENU': [
            { str: "What will GOLEM do?", x: 15, y: 260 },
            { str: "FIGHT", x: 180, y: 260 },
            { str: "TIKUN", x: 250, y: 260 },
            { str: "PARTY", x: 180, y: 290 },
            { str: "RUN", x: 250, y: 290 }
        ],
        'FIGHT_MENU': [
            { str: "- TACKLE", x: 15, y: 260 },
            { str: "- ROCK BASH", x: 120, y: 260 },
            { str: "- ABSORB", x: 15, y: 290 },
            { str: "- SHIELD", x: 120, y: 290 }
        ],
        'TEXT_FEED': [
            // Uses getter wrapper logically implicitly
            { get str() { return StateRegister.BattleLogQueue[0] || "..."; }, x: 15, y: 270 }
        ]
    },
    CursorMap: {
        'MAIN_MENU': {
            0: { x: 165, y: 260 },
            1: { x: 235, y: 260 },
            2: { x: 165, y: 290 },
            3: { x: 235, y: 290 }
        },
        'FIGHT_MENU': {
            0: { x: 5, y: 260 },
            1: { x: 110, y: 260 },
            2: { x: 5, y: 290 },
            3: { x: 110, y: 290 }
        }
    }
};
