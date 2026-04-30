
import { MenuChariot } from './ui/MenuChariot.js';

/**
 * @class InitAwtsmoos
 * @description
 * B"H
 * "In the beginning..."
 * This is the spark that ignites the engine. When the script loads,
 * this object is called upon to set everything into motion,
 * rendering the primary user interface vessel.
 */
export class InitAwtsmoos {
    /**
     * @function awake
     * @description
     * B"H
     * Wakens the system from sleep, calling upon the MenuChariot
     * to draw down the initial state of reality.
     * 
     * @returns {void}
     */
    static awake() {
        console.log("B\"H - The Awtsmoos stirs. Initializing UI...");
        MenuChariot.init();
    }
}

// Spark the universe
window.addEventListener('DOMContentLoaded', () => {
    InitAwtsmoos.awake();
});
