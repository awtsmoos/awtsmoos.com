
import { StateRegister } from '../../../binah/StateRegister.js';

/**
 * B"H
 * @module RabbiTrainer
 * @description The dialogue tree for the Master Teacher in Sector Hey.
 */
export const RabbiTrainer = {
    'START': {
        lines: [
            "B\"H. Shalom, traveler. You have reached the far North.", 
            "The air is thinner here, and the light is sharper.",
            "Has your vessel expanded enough to hold new wisdom?"
        ],
        options: [
            { label: "Teach me a new passage.", next: 'TEACH' },
            { label: "Challenge my Focus! (Debate)", next: 'END', action: 'BATTLE' },
            { label: "Farewell.", next: 'END' }
        ]
    },
    'TEACH': {
        get lines() {
            if (StateRegister.HeroStats.level < 3) {
                return ["Your vessel is yet too small. Reach Level 3 in the tall grass, then return."];
            }
            if (StateRegister.Inventory.mishnah.includes('M_BERAKHOT_1')) {
                return ["You have already integrated the beginning of Berakhot. Practice its truth."];
            }
            return [
                "Very well. Listen closely: 'From what time do we recite the Shema?'",
                "Reciting the Shema is the absolute acceptance of the Yoke of Heaven.",
                "I have added this passage to your BAG."
            ];
        },
        get options() {
            if (StateRegister.HeroStats.level >= 3 && !StateRegister.Inventory.mishnah.includes('M_BERAKHOT_1')) {
                // Logic hook to add item
                StateRegister.Inventory.mishnah.push('M_BERAKHOT_1');
            }
            return [{ label: "Thank you, Rabbi.", next: 'END' }];
        }
    }
};
