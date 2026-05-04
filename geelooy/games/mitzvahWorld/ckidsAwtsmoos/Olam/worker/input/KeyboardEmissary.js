
/**
 * @module KeyboardEmissary
 * @description
 * 🎹 CHAPTER 2: THE REINS OF WILL 🎹
 * 
 * Every key pressed is a decree. "Walk forward!", "Leap up!"
 * This module listens to the physical keyboard and relays the user's
 * intent across the thread boundary to the waiting Oyved (Worker),
 * explicitly pausing only when the user intends to converse (Input Fields).
 */
import SefiraOfInput from './SefiraOfInput.js';

export default class KeyboardEmissary {
    /**
     * @method bind
     * @param {Worker} worker - The angelic messenger.
     */
    static bind(worker) {
        window.addEventListener('keydown', (e) => {
            const isTyping = document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName.toUpperCase());
            if (!isTyping) {
                worker.postMessage({ keydown: SefiraOfInput.cleanseEvent(e) });
            }
        });

        window.addEventListener('keyup', (e) => {
            const isTyping = document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName.toUpperCase());
            if (!isTyping) {
                worker.postMessage({ keyup: SefiraOfInput.cleanseEvent(e) });
            }
        });
        
        // B"H: silent

    }
}
