
import { StateRegister } from '../../../../binah/StateRegister.js';

/**
 * B"H
 * @module BeggarDialogue
 */
export const BeggarDialogue = {
    'START': {
        lines: [
            "B\"H. Spare a spark for a broken vessel?", 
            "The road is long and the Klipot are thick."
        ],
        options: [
            { label: "Give 10 Gelt.", next: 'GIVE' },
            { label: "I have nothing.", next: 'END' }
        ]
    },
    'GIVE': {
        get lines() {
            if (StateRegister.Gelt >= 10) {
                StateRegister.Gelt -= 10;
                return ["Blessings upon you! The act of Tzedakah breaks all harsh decrees.", "Your vessel expands through giving."];
            }
            return ["Your heart is willing, but your pockets are empty. Go in peace."];
        },
        options: [{ label: "Amen.", next: 'END' }]
    }
};
