
import { StateRegister } from '../../../binah/StateRegister.js';

export const MerchantTailor = {
    'START': {
        lines: [
            "B\"H. A soul needs a proper garment to act in the world.", 
            "I have woven some new robes from the finest threads."
        ],
        options: [
            { label: "Purity White (10 Gelt)", next: 'BUY_WHITE' },
            { label: "Crown Gold (40 Gelt)", next: 'BUY_GOLD' },
            { label: "Judgment Black (20 Gelt)", next: 'BUY_BLACK' },
            { label: "I am fine for now.", next: 'END' }
        ]
    },
    'BUY_WHITE': {
        get lines() {
            if (StateRegister.Gelt < 10) return ["Not enough Gelt."];
            if (StateRegister.Outfits.owned.includes('WHITE_ROBE')) return ["You own this."];
            StateRegister.Gelt -= 10;
            StateRegister.Outfits.owned.push('WHITE_ROBE');
            return ["Wear it in holiness."];
        },
        options: [{ label: "Amen.", next: 'END' }]
    },
    'BUY_GOLD': {
        get lines() {
            if (StateRegister.Gelt < 40) return ["Not enough Gelt."];
            if (StateRegister.Outfits.owned.includes('GOLD_ROBE')) return ["You own this."];
            StateRegister.Gelt -= 40;
            StateRegister.Outfits.owned.push('GOLD_ROBE');
            return ["A robe fit for a king's servant."];
        },
        options: [{ label: "Amen.", next: 'END' }]
    },
    'BUY_BLACK': {
        get lines() {
            if (StateRegister.Gelt < 20) return ["Not enough Gelt."];
            if (StateRegister.Outfits.owned.includes('DARK_ROBE')) return ["You own this."];
            StateRegister.Gelt -= 20;
            StateRegister.Outfits.owned.push('DARK_ROBE');
            return ["A robe of power and severity."];
        },
        options: [{ label: "Amen.", next: 'END' }]
    }
};
