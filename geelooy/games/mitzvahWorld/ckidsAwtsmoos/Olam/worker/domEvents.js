
/**
 * @module DomEventsUnified
 * @description
 * 🌉 CHAPTER 5: THE UNIFIED BRIDGE 🌉
 * 
 * Bringing the disparate senses together into a single monitoring routine.
 * It observes the window, its growth (resize), its touch, and its keyboard.
 * Everything is passed through to the Worker manager.
 */
import KeyboardEmissary from './input/KeyboardEmissary.js';
import MouseEmissary from './input/MouseEmissary.js';
import TouchOrchestrator from './input/TouchOrchestrator.js';

export default function setupDomEvents(manager) {
    const { eved } = manager;

    // B"H: silent


    // 1. Initial Measurement
    const broadcastResize = () => {
        const payload = {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1
        };
        eved.postMessage({ resize: payload });
    };

    window.addEventListener('resize', broadcastResize);

    // 2. Bind Senses
    KeyboardEmissary.bind(eved);
    MouseEmissary.bind(eved);
    TouchOrchestrator.bind(eved);

    // 3. Initial Pulse
    broadcastResize();

    // Prevent system menus on Right-Click unless over UI
    window.addEventListener("contextmenu", e => {
        const markers = [
            'button', '.mitzvahBtn', '.awtsmoosBtn', '.ctx-btn',
            '.characterDesigner', '.store-container', '.quest-log'
        ];
        if (!e.target.closest(markers.join(', '))) {
            e.preventDefault();
        }
    });
}
