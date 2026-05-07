
import { StateRegister } from '../binah/StateRegister.js';

/**
 * B"H
 * @class KeyboardKeter
 * @chapter The Crown of the Keys
 * @description
 * Binds the physical strikes of the mortal keyboard into the spiritual intents of the simulation.
 */
export class KeyboardKeter {
    static bind() {
        const map = {
            'ArrowUp': 'U', 'w': 'U', 'W': 'U',
            'ArrowDown': 'D', 's': 'D', 'S': 'D',
            'ArrowLeft': 'L', 'a': 'L', 'A': 'L',
            'ArrowRight': 'R', 'd': 'R', 'D': 'R',
            'z': 'A', 'Enter': 'A', ' ': 'A', 'e': 'A', 'E': 'A',
            'x': 'B', 'Shift': 'B', 'q': 'B', 'Q': 'B',
            'i': 'I'
        };

        window.addEventListener('keydown', e => {
            const sig = map[e.key];
            if (sig) { 
                if (e.key !== 'F12' && !e.ctrlKey) e.preventDefault(); 
                window.AwtsmoosIntents[sig] = 1; 
                
                if (sig === 'I') {
                    if (StateRegister.ActiveRealm === 'OVERWORLD') {
                        StateRegister.ActiveRealm = 'INVENTORY';
                        window.dispatchEvent(new Event('awtsmoos-inventory-open'));
                    } else if (StateRegister.ActiveRealm === 'INVENTORY') {
                        StateRegister.ActiveRealm = 'OVERWORLD';
                        window.dispatchEvent(new Event('awtsmoos-inventory-close'));
                    }
                }
            }
        }, {passive: false});

        window.addEventListener('keyup', e => {
            const sig = map[e.key];
            if (sig) { e.preventDefault(); window.AwtsmoosIntents[sig] = 0; }
        }, {passive: false});
    }
}
