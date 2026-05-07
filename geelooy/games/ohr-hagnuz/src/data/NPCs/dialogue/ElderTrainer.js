
import { StateRegister } from '../../../binah/StateRegister.js';

/**
 * B"H
 * @module ElderTrainer
 * @description The dialogue tree for the Elder in Sector Beis.
 */
export const ElderTrainer = {
    'START': {
        lines: [
            "B\"H. The path of Gevurah is rigorous.", 
            "Here in Sector Beis, the Klipot are more intense.",
            "Do you wish to sharpen your arguments?"
        ],
        options: [
            { label: "Train with me! (Battle)", next: 'END', action: 'BATTLE' },
            { label: "Assess my Vessel.", next: 'CHECK_LVL' },
            { label: "Farewell.", next: 'END' }
        ]
    },
    'CHECK_LVL': {
        // Dialogue lines can be dynamically fetched or evaluated
        get lines() {
            return [
                `You have reached Level ${StateRegister.HeroStats.level}.`, 
                `You carry ${StateRegister.HeroStats.xp} sparks. You need ${StateRegister.HeroStats.xpNeeded} for the next expansion.`,
                "Your light grows. Continue the work."
            ];
        },
        options: [{ label: "I will.", next: 'END' }]
    }
};
