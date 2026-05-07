
import { StateRegister } from '../../../binah/StateRegister.js';

export const MerchantScribe = {
    'START': {
        lines: [
            "B\"H. I have hewn new Kelim from the pure light.", 
            "Which vessel would you like to manifest today?"
        ],
        options: [
            { label: "Menorah (20 Gelt)", next: 'BUY_MENORAH' },
            { label: "Shofar (15 Gelt)", next: 'BUY_SHOFAR' },
            { label: "Luchot (50 Gelt)", next: 'BUY_LUKHOT' },
            { label: "I am browsing.", next: 'END' }
        ]
    },
    'BUY_MENORAH': {
        get lines() {
            if (StateRegister.Gelt < 20) return ["You lack the necessary sparks of currency."];
            if (StateRegister.Vessels.owned.includes('MENORAH')) return ["You already possess this container."];
            StateRegister.Gelt -= 20;
            StateRegister.Vessels.owned.push('MENORAH');
            return ["The Menorah is now yours. Illuminate the darkness."];
        },
        options: [{ label: "Thank you.", next: 'END' }]
    },
    'BUY_SHOFAR': {
        get lines() {
            if (StateRegister.Gelt < 15) return ["You lack the necessary sparks of currency."];
            if (StateRegister.Vessels.owned.includes('SHOFAR')) return ["You already possess this container."];
            StateRegister.Gelt -= 15;
            StateRegister.Vessels.owned.push('SHOFAR');
            return ["The Shofar is now yours. Wake up the sleeping hearts."];
        },
        options: [{ label: "Thank you.", next: 'END' }]
    },
    'BUY_LUKHOT': {
        get lines() {
            if (StateRegister.Gelt < 50) return ["You lack the necessary sparks of currency."];
            if (StateRegister.Vessels.owned.includes('TABLETS')) return ["You already possess this container."];
            StateRegister.Gelt -= 50;
            StateRegister.Vessels.owned.push('TABLETS');
            return ["The Tablets are now yours. The foundation is set."];
        },
        options: [{ label: "Thank you.", next: 'END' }]
    }
};
